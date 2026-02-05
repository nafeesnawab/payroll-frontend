import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { differenceInBusinessDays, parseISO } from "date-fns";
import { ArrowLeft, CalendarPlus, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import type { CreateESSLeaveRequest, ESSLeaveBalance } from "@/types/ess";
import type { LeaveType } from "@/types/leave";
import { Alert, AlertDescription } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Textarea } from "@/ui/textarea";

const leaveRequestSchema = z
	.object({
		leaveTypeId: z.string().min(1, "Please select a leave type"),
		startDate: z.string().min(1, "Start date is required"),
		endDate: z.string().min(1, "End date is required"),
		reason: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.startDate && data.endDate) {
				return new Date(data.startDate) <= new Date(data.endDate);
			}
			return true;
		},
		{
			message: "End date must be after start date",
			path: ["endDate"],
		},
	);

type LeaveRequestForm = z.infer<typeof leaveRequestSchema>;

export default function ESSApplyLeavePage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: leaveTypes, isLoading: loadingTypes } = useQuery({
		queryKey: ["leave-types"],
		queryFn: async () => {
			const response = await axios.get("/api/leave/types");
			return response.data.data as LeaveType[];
		},
	});

	const { data: balances, isLoading: loadingBalances } = useQuery({
		queryKey: ["ess-leave-balances"],
		queryFn: async () => {
			const response = await axios.get("/api/ess/leave/balances");
			return response.data.data as ESSLeaveBalance[];
		},
	});

	const form = useForm<LeaveRequestForm>({
		resolver: zodResolver(leaveRequestSchema),
		defaultValues: {
			leaveTypeId: "",
			startDate: "",
			endDate: "",
			reason: "",
		},
	});

	const selectedTypeId = form.watch("leaveTypeId");
	const startDate = form.watch("startDate");
	const endDate = form.watch("endDate");

	const selectedType = leaveTypes?.find((t) => t.id === selectedTypeId);
	const selectedBalance = balances?.find((b) => b.leaveTypeId === selectedTypeId);

	const calculatedDays =
		startDate && endDate ? Math.max(1, differenceInBusinessDays(parseISO(endDate), parseISO(startDate)) + 1) : 0;

	const remainingBalance = selectedBalance ? selectedBalance.available - calculatedDays : 0;

	const createRequest = useMutation({
		mutationFn: async (data: CreateESSLeaveRequest) => {
			const response = await axios.post("/api/ess/leave/requests", data);
			return response.data;
		},
		onSuccess: () => {
			toast.success("Leave request submitted successfully");
			queryClient.invalidateQueries({ queryKey: ["ess-leave-requests"] });
			queryClient.invalidateQueries({ queryKey: ["ess-leave-balances"] });
			navigate("/ess/leave");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to submit leave request");
		},
	});

	const onSubmit = (data: LeaveRequestForm) => {
		createRequest.mutate({
			leaveTypeId: data.leaveTypeId,
			startDate: data.startDate,
			endDate: data.endDate,
			reason: data.reason,
		});
	};

	const isLoading = loadingTypes || loadingBalances;

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-96" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => navigate("/ess/leave")}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<CalendarPlus className="h-6 w-6" />
						Apply for Leave
					</h1>
					<p className="text-muted-foreground">Submit a new leave request</p>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Leave Request Details</CardTitle>
							<CardDescription>Fill in the details for your leave request</CardDescription>
						</CardHeader>
						<CardContent>
							<Form {...form}>
								<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
									<FormField
										control={form.control}
										name="leaveTypeId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Leave Type</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select leave type" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{leaveTypes
															?.filter((t) => t.isActive)
															.map((type) => (
																<SelectItem key={type.id} value={type.id}>
																	{type.name}
																</SelectItem>
															))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="grid gap-4 sm:grid-cols-2">
										<FormField
											control={form.control}
											name="startDate"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Start Date</FormLabel>
													<FormControl>
														<Input type="date" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="endDate"
											render={({ field }) => (
												<FormItem>
													<FormLabel>End Date</FormLabel>
													<FormControl>
														<Input type="date" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									{calculatedDays > 0 && (
										<Alert>
											<AlertDescription className="flex items-center justify-between">
												<span>
													Leave duration: <strong>{calculatedDays} business day(s)</strong>
												</span>
												{selectedBalance && (
													<span>
														Balance after:{" "}
														<Badge variant={remainingBalance < 0 ? "destructive" : "secondary"}>
															{remainingBalance} days
														</Badge>
													</span>
												)}
											</AlertDescription>
										</Alert>
									)}

									{remainingBalance < 0 && !selectedType?.allowNegativeBalance && (
										<Alert variant="destructive">
											<AlertDescription>
												Insufficient leave balance. You only have {selectedBalance?.available} days available.
											</AlertDescription>
										</Alert>
									)}

									<FormField
										control={form.control}
										name="reason"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Reason (Optional)</FormLabel>
												<FormControl>
													<Textarea placeholder="Provide a reason for your leave request..." {...field} />
												</FormControl>
												<FormDescription>This will be visible to your manager for approval</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									{selectedType?.requiresAttachment && (
										<div className="border-2 border-dashed rounded-lg p-6 text-center">
											<Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
											<p className="text-sm text-muted-foreground">This leave type requires a supporting document</p>
											<Button variant="outline" size="sm" className="mt-2" type="button">
												Upload Document
											</Button>
										</div>
									)}

									<div className="flex gap-4">
										<Button type="button" variant="outline" onClick={() => navigate("/ess/leave")}>
											Cancel
										</Button>
										<Button
											type="submit"
											disabled={
												createRequest.isPending || (remainingBalance < 0 && !selectedType?.allowNegativeBalance)
											}
										>
											{createRequest.isPending ? "Submitting..." : "Submit Request"}
										</Button>
									</div>
								</form>
							</Form>
						</CardContent>
					</Card>
				</div>

				{/* Balance Summary */}
				<div>
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Leave Balances</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{balances?.map((balance) => (
								<div
									key={balance.leaveTypeId}
									className={`flex justify-between items-center p-2 rounded ${
										balance.leaveTypeId === selectedTypeId ? "bg-primary/10" : ""
									}`}
								>
									<span className="text-sm">{balance.leaveTypeName}</span>
									<Badge
										variant={
											balance.available < 0
												? "destructive"
												: balance.leaveTypeId === selectedTypeId
													? "default"
													: "secondary"
										}
									>
										{balance.available} days
									</Badge>
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";
import type { LeaveBalance, LeaveType } from "@/types/leave";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, CalendarPlus, Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const requestSchema = z.object({
	leaveTypeId: z.string().min(1, "Leave type is required"),
	startDate: z.string().min(1, "Start date is required"),
	endDate: z.string().min(1, "End date is required"),
	isPartialDay: z.boolean(),
	partialHours: z.number().optional(),
	reason: z.string().optional(),
});

type RequestFormValues = z.infer<typeof requestSchema>;

function calculateDays(startDate: string, endDate: string, isPartial: boolean, partialHours?: number): number {
	if (!startDate || !endDate) return 0;
	const start = new Date(startDate);
	const end = new Date(endDate);
	if (end < start) return 0;
	const diffTime = Math.abs(end.getTime() - start.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
	if (isPartial && partialHours) {
		return partialHours / 8;
	}
	return diffDays;
}

export default function NewLeaveRequestPage() {
	const navigate = useNavigate();

	const form = useForm<RequestFormValues>({
		resolver: zodResolver(requestSchema),
		defaultValues: {
			leaveTypeId: "",
			startDate: "",
			endDate: "",
			isPartialDay: false,
			partialHours: undefined,
			reason: "",
		},
	});

	const watchedValues = useWatch({ control: form.control });
	const selectedTypeId = watchedValues.leaveTypeId;
	const calculatedDays = calculateDays(
		watchedValues.startDate || "",
		watchedValues.endDate || "",
		watchedValues.isPartialDay || false,
		watchedValues.partialHours
	);

	const { data: leaveTypes } = useQuery({
		queryKey: ["leave-types"],
		queryFn: async () => {
			const response = await axios.get("/api/leave/types");
			return response.data.data as LeaveType[];
		},
	});

	const { data: myBalances } = useQuery({
		queryKey: ["my-leave-balances"],
		queryFn: async () => {
			const response = await axios.get("/api/leave/my/balances");
			return response.data.data as LeaveBalance[];
		},
	});

	const selectedType = leaveTypes?.find((t) => t.id === selectedTypeId);
	const selectedBalance = myBalances?.find((b) => b.leaveTypeId === selectedTypeId);

	const submitMutation = useMutation({
		mutationFn: async (data: RequestFormValues) => {
			return axios.post("/api/leave/requests", { ...data, days: calculatedDays });
		},
		onSuccess: () => {
			toast.success("Leave request submitted");
			navigate("/leave/my-leave");
		},
		onError: () => {
			toast.error("Failed to submit request");
		},
	});

	const insufficientBalance = selectedBalance && calculatedDays > selectedBalance.available && !selectedType?.allowNegativeBalance;

	return (
		<div className="p-6 max-w-2xl mx-auto">
			<div className="mb-6">
				<Button variant="ghost" onClick={() => navigate("/leave")}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Leave
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CalendarPlus className="h-5 w-5" />
						Request Leave
					</CardTitle>
					<CardDescription>Submit a new leave request for approval</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit((data) => submitMutation.mutate(data))} className="space-y-6">
							<FormField
								control={form.control}
								name="leaveTypeId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Leave Type *</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select leave type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{leaveTypes?.filter((t) => t.isActive).map((lt) => (
													<SelectItem key={lt.id} value={lt.id}>{lt.name}</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{selectedBalance && (
								<Card className="bg-muted/50">
									<CardContent className="py-4">
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">Available Balance</span>
											<Badge variant={selectedBalance.isNegative ? "destructive" : "default"} className="text-lg">
												{selectedBalance.available} days
											</Badge>
										</div>
									</CardContent>
								</Card>
							)}

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="startDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Start Date *</FormLabel>
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
											<FormLabel>End Date *</FormLabel>
											<FormControl>
												<Input type="date" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="isPartialDay"
								render={({ field }) => (
									<FormItem className="flex items-center gap-3">
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
										<div>
											<FormLabel className="!mt-0">Partial Day</FormLabel>
											<FormDescription>Request less than a full day</FormDescription>
										</div>
									</FormItem>
								)}
							/>

							{watchedValues.isPartialDay && (
								<FormField
									control={form.control}
									name="partialHours"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Hours</FormLabel>
											<FormControl>
												<Input type="number" min={1} max={7} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
											</FormControl>
											<FormDescription>Number of hours (1-7)</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							<FormField
								control={form.control}
								name="reason"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Reason</FormLabel>
										<FormControl>
											<Textarea placeholder="Optional reason for leave..." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{selectedType?.requiresAttachment && (
								<Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
									<CardContent className="py-4">
										<p className="text-sm text-amber-700 dark:text-amber-400">
											This leave type requires an attachment (e.g., medical certificate). Please upload after submission.
										</p>
									</CardContent>
								</Card>
							)}

							{calculatedDays > 0 && (
								<Card className={insufficientBalance ? "border-destructive bg-destructive/5" : "bg-muted/50"}>
									<CardContent className="py-4">
										<div className="flex justify-between items-center">
											<span className="font-medium">Days Requested</span>
											<span className="text-2xl font-bold">{calculatedDays}</span>
										</div>
										{insufficientBalance && (
											<p className="text-sm text-destructive mt-2">
												Insufficient balance. Available: {selectedBalance?.available} days
											</p>
										)}
									</CardContent>
								</Card>
							)}

							<div className="flex justify-end gap-3">
								<Button type="button" variant="outline" onClick={() => navigate("/leave")}>
									Cancel
								</Button>
								<Button type="submit" disabled={submitMutation.isPending || insufficientBalance}>
									{submitMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
									Submit Request
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Calendar, CheckCircle2, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const leaveTypeSchema = z.object({
	name: z.string().min(1, "Name is required"),
	category: z.enum(["annual", "sick", "family", "unpaid", "custom"]),
	accrualMethod: z.enum(["monthly", "per_hour", "upfront"]),
	daysPerYear: z.coerce.number().min(0),
	carryOverDays: z.coerce.number().min(0),
	allowNegative: z.boolean(),
});

type LeaveTypeFormValues = z.infer<typeof leaveTypeSchema>;

interface LeaveType {
	id: string;
	name: string;
	category: string;
	accrualMethod: string;
	daysPerYear: number;
	carryOverDays: number;
	allowNegative: boolean;
	isActive: boolean;
}

const categoryLabels: Record<string, string> = {
	annual: "Annual",
	sick: "Sick",
	family: "Family Responsibility",
	unpaid: "Unpaid",
	custom: "Custom",
};

export default function LeaveTypesPage() {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const { data: leaveTypes, isLoading } = useQuery({
		queryKey: ["settings", "leave-types"],
		queryFn: async () => {
			const response = await axios.get("/api/settings/leave-types");
			return response.data.data as LeaveType[];
		},
	});

	const form = useForm<LeaveTypeFormValues>({
		resolver: zodResolver(leaveTypeSchema),
		defaultValues: {
			name: "",
			category: "annual",
			accrualMethod: "monthly",
			daysPerYear: 15,
			carryOverDays: 0,
			allowNegative: false,
		},
	});

	const createMutation = useMutation({
		mutationFn: async (data: LeaveTypeFormValues) => {
			const response = await axios.post("/api/settings/leave-types", { ...data, isActive: true });
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings", "leave-types"] });
			toast.success("Leave type added");
			setOpen(false);
			form.reset();
		},
	});

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<div className="grid gap-4 md:grid-cols-2">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-32" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Calendar className="h-6 w-6" />
						Leave Types
					</h1>
					<p className="text-muted-foreground">Configure leave types and accrual rules</p>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Add Leave Type
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Leave Type</DialogTitle>
						</DialogHeader>
						<Form {...form}>
							<form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name *</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="category"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Category *</FormLabel>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="annual">Annual</SelectItem>
														<SelectItem value="sick">Sick</SelectItem>
														<SelectItem value="family">Family Responsibility</SelectItem>
														<SelectItem value="unpaid">Unpaid</SelectItem>
														<SelectItem value="custom">Custom</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="accrualMethod"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Accrual Method *</FormLabel>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="monthly">Monthly</SelectItem>
														<SelectItem value="per_hour">Per Hour Worked</SelectItem>
														<SelectItem value="upfront">Upfront</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="daysPerYear"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Days Per Year *</FormLabel>
												<FormControl>
													<Input type="number" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="carryOverDays"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Carry-over Days</FormLabel>
												<FormControl>
													<Input type="number" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<FormField
									control={form.control}
									name="allowNegative"
									render={({ field }) => (
										<FormItem className="flex items-center justify-between rounded-lg border p-3">
											<div>
												<FormLabel>Allow Negative Balance</FormLabel>
												<p className="text-sm text-muted-foreground">Employees can take leave before accrual</p>
											</div>
											<FormControl>
												<Switch checked={field.value} onCheckedChange={field.onChange} />
											</FormControl>
										</FormItem>
									)}
								/>
								<div className="flex justify-end gap-2 pt-4">
									<Button type="button" variant="outline" onClick={() => setOpen(false)}>
										Cancel
									</Button>
									<Button type="submit" disabled={createMutation.isPending}>
										{createMutation.isPending ? (
											<Loader2 className="h-4 w-4 animate-spin mr-2" />
										) : (
											<CheckCircle2 className="h-4 w-4 mr-2" />
										)}
										Add
									</Button>
								</div>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{leaveTypes?.map((lt) => (
					<Card key={lt.id}>
						<CardHeader className="pb-2">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg">{lt.name}</CardTitle>
								<Badge variant="outline">{categoryLabels[lt.category]}</Badge>
							</div>
							<CardDescription>{lt.daysPerYear} days per year</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex gap-4 text-sm text-muted-foreground">
								<span>Accrual: {lt.accrualMethod}</span>
								{lt.carryOverDays > 0 && <span>Carry-over: {lt.carryOverDays} days</span>}
								{lt.allowNegative && <Badge variant="secondary">Negative OK</Badge>}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";
import type { LeaveType } from "@/types/leave";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Loader2, PenLine, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const leaveTypeSchema = z.object({
	name: z.string().min(1, "Name is required"),
	code: z.string().min(1, "Code is required").max(10),
	accrualMethod: z.enum(["monthly", "annual", "none"]),
	accrualRate: z.number().min(0),
	cycleStartMonth: z.number().min(1).max(12),
	carryOverLimit: z.number().nullable(),
	allowNegativeBalance: z.boolean(),
	requiresAttachment: z.boolean(),
	isPaid: z.boolean(),
});

type LeaveTypeFormValues = z.infer<typeof leaveTypeSchema>;

export default function LeaveSettingsPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingType, setEditingType] = useState<LeaveType | null>(null);

	const { data: leaveTypes, isLoading } = useQuery({
		queryKey: ["leave-types"],
		queryFn: async () => {
			const response = await axios.get("/api/leave/types");
			return response.data.data as LeaveType[];
		},
	});

	const form = useForm<LeaveTypeFormValues>({
		resolver: zodResolver(leaveTypeSchema),
		defaultValues: {
			name: "",
			code: "",
			accrualMethod: "monthly",
			accrualRate: 1.25,
			cycleStartMonth: 1,
			carryOverLimit: null,
			allowNegativeBalance: false,
			requiresAttachment: false,
			isPaid: true,
		},
	});

	const createMutation = useMutation({
		mutationFn: async (data: LeaveTypeFormValues) => axios.post("/api/leave/types", data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leave-types"] });
			setDialogOpen(false);
			form.reset();
			toast.success("Leave type created");
		},
	});

	const updateMutation = useMutation({
		mutationFn: async ({ id, data }: { id: string; data: LeaveTypeFormValues }) =>
			axios.put(`/api/leave/types/${id}`, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leave-types"] });
			setDialogOpen(false);
			setEditingType(null);
			form.reset();
			toast.success("Leave type updated");
		},
	});

	const openCreateDialog = () => {
		setEditingType(null);
		form.reset({
			name: "",
			code: "",
			accrualMethod: "monthly",
			accrualRate: 1.25,
			cycleStartMonth: 1,
			carryOverLimit: null,
			allowNegativeBalance: false,
			requiresAttachment: false,
			isPaid: true,
		});
		setDialogOpen(true);
	};

	const openEditDialog = (lt: LeaveType) => {
		setEditingType(lt);
		form.reset({
			name: lt.name,
			code: lt.code,
			accrualMethod: lt.accrualMethod,
			accrualRate: lt.accrualRate,
			cycleStartMonth: lt.cycleStartMonth,
			carryOverLimit: lt.carryOverLimit,
			allowNegativeBalance: lt.allowNegativeBalance,
			requiresAttachment: lt.requiresAttachment,
			isPaid: lt.isPaid,
		});
		setDialogOpen(true);
	};

	const onSubmit = (data: LeaveTypeFormValues) => {
		if (editingType) {
			updateMutation.mutate({ id: editingType.id, data });
		} else {
			createMutation.mutate(data);
		}
	};

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => navigate("/leave")}>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div className="flex-1">
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Settings className="h-6 w-6" />
						Leave Settings
					</h1>
					<p className="text-muted-foreground">Configure leave types and accrual rules</p>
				</div>
				<Button onClick={openCreateDialog}>
					<Plus className="h-4 w-4 mr-2" />
					Add Leave Type
				</Button>
			</div>

			{isLoading ? (
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-32 w-full" />
					))}
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2">
					{leaveTypes?.map((lt) => (
						<Card key={lt.id}>
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="flex items-center gap-2">
											{lt.name}
											<Badge variant="outline">{lt.code}</Badge>
										</CardTitle>
										<CardDescription>
											{lt.accrualMethod === "none" ? "No accrual" : `${lt.accrualRate} days ${lt.accrualMethod}`}
										</CardDescription>
									</div>
									<Button variant="ghost" size="icon" onClick={() => openEditDialog(lt)}>
										<PenLine className="h-4 w-4" />
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									<Badge variant={lt.isPaid ? "default" : "secondary"}>{lt.isPaid ? "Paid" : "Unpaid"}</Badge>
									{lt.allowNegativeBalance && <Badge variant="outline">Negative OK</Badge>}
									{lt.requiresAttachment && <Badge variant="outline">Attachment Required</Badge>}
									{lt.carryOverLimit !== null && <Badge variant="outline">Carry-over: {lt.carryOverLimit}</Badge>}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>{editingType ? "Edit Leave Type" : "Add Leave Type"}</DialogTitle>
					</DialogHeader>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
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
								<FormField
									control={form.control}
									name="code"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Code *</FormLabel>
											<FormControl>
												<Input {...field} maxLength={10} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="accrualMethod"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Accrual Method</FormLabel>
											<Select onValueChange={field.onChange} value={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="monthly">Monthly</SelectItem>
													<SelectItem value="annual">Annual</SelectItem>
													<SelectItem value="none">None</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="accrualRate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Accrual Rate</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.01"
													{...field}
													onChange={(e) => field.onChange(Number(e.target.value))}
												/>
											</FormControl>
											<FormDescription>Days per period</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="cycleStartMonth"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Cycle Start Month</FormLabel>
										<Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{[
													"January",
													"February",
													"March",
													"April",
													"May",
													"June",
													"July",
													"August",
													"September",
													"October",
													"November",
													"December",
												].map((m, i) => (
													<SelectItem key={m} value={String(i + 1)}>
														{m}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-3 gap-4">
								<FormField
									control={form.control}
									name="isPaid"
									render={({ field }) => (
										<FormItem className="flex items-center gap-2">
											<FormControl>
												<Switch checked={field.value} onCheckedChange={field.onChange} />
											</FormControl>
											<FormLabel className="!mt-0">Paid Leave</FormLabel>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="allowNegativeBalance"
									render={({ field }) => (
										<FormItem className="flex items-center gap-2">
											<FormControl>
												<Switch checked={field.value} onCheckedChange={field.onChange} />
											</FormControl>
											<FormLabel className="!mt-0">Allow Negative</FormLabel>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="requiresAttachment"
									render={({ field }) => (
										<FormItem className="flex items-center gap-2">
											<FormControl>
												<Switch checked={field.value} onCheckedChange={field.onChange} />
											</FormControl>
											<FormLabel className="!mt-0">Require Attachment</FormLabel>
										</FormItem>
									)}
								/>
							</div>

							<div className="flex justify-end gap-2 pt-4">
								<Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
									Cancel
								</Button>
								<Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
									{(createMutation.isPending || updateMutation.isPending) && (
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
									)}
									{editingType ? "Update" : "Create"}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}

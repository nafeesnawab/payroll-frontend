import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CheckCircle2, Loader2, Minus, Plus, Wallet } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const payrollItemSchema = z.object({
	name: z.string().min(1, "Name is required"),
	code: z.string().min(1, "Code is required"),
	type: z.enum(["earning", "deduction"]),
	taxable: z.boolean(),
	uifApplicable: z.boolean(),
	isRecurring: z.boolean(),
});

type PayrollItemFormValues = z.infer<typeof payrollItemSchema>;

interface PayrollItem {
	id: string;
	name: string;
	code: string;
	type: string;
	taxable: boolean;
	uifApplicable: boolean;
	isRecurring: boolean;
	isActive: boolean;
}

export default function PayrollItemsPage() {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const { data: items, isLoading } = useQuery({
		queryKey: ["settings", "payroll-items"],
		queryFn: async () => {
			const response = await axios.get("/api/settings/payroll-items");
			return response.data.data as PayrollItem[];
		},
	});

	const form = useForm<PayrollItemFormValues>({
		resolver: zodResolver(payrollItemSchema),
		defaultValues: { name: "", code: "", type: "earning", taxable: true, uifApplicable: true, isRecurring: false },
	});

	const createMutation = useMutation({
		mutationFn: async (data: PayrollItemFormValues) => {
			const response = await axios.post("/api/settings/payroll-items", { ...data, isActive: true });
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings", "payroll-items"] });
			toast.success("Payroll item added");
			setOpen(false);
			form.reset();
		},
	});

	const earnings = items?.filter((i) => i.type === "earning") || [];
	const deductions = items?.filter((i) => i.type === "deduction") || [];

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Wallet className="h-6 w-6" />
						Payroll Items
					</h1>
					<p className="text-muted-foreground">Define earnings and deductions</p>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button><Plus className="h-4 w-4 mr-2" />Add Item</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Payroll Item</DialogTitle>
						</DialogHeader>
						<Form {...form}>
							<form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<FormField control={form.control} name="name" render={({ field }) => (
										<FormItem>
											<FormLabel>Name *</FormLabel>
											<FormControl><Input {...field} /></FormControl>
											<FormMessage />
										</FormItem>
									)} />
									<FormField control={form.control} name="code" render={({ field }) => (
										<FormItem>
											<FormLabel>Code *</FormLabel>
											<FormControl><Input {...field} /></FormControl>
											<FormMessage />
										</FormItem>
									)} />
								</div>
								<FormField control={form.control} name="type" render={({ field }) => (
									<FormItem>
										<FormLabel>Type *</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
											<SelectContent>
												<SelectItem value="earning">Earning</SelectItem>
												<SelectItem value="deduction">Deduction</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)} />
								<FormField control={form.control} name="taxable" render={({ field }) => (
									<FormItem className="flex items-center justify-between rounded-lg border p-3">
										<FormLabel>Taxable</FormLabel>
										<FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
									</FormItem>
								)} />
								<FormField control={form.control} name="uifApplicable" render={({ field }) => (
									<FormItem className="flex items-center justify-between rounded-lg border p-3">
										<FormLabel>UIF Applicable</FormLabel>
										<FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
									</FormItem>
								)} />
								<FormField control={form.control} name="isRecurring" render={({ field }) => (
									<FormItem className="flex items-center justify-between rounded-lg border p-3">
										<FormLabel>Recurring</FormLabel>
										<FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
									</FormItem>
								)} />
								<div className="flex justify-end gap-2 pt-4">
									<Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
									<Button type="submit" disabled={createMutation.isPending}>
										{createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
										Add
									</Button>
								</div>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<div>
					<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
						<Plus className="h-5 w-5 text-green-600" />
						Earnings
					</h2>
					<div className="space-y-3">
						{earnings.map((item) => (
							<Card key={item.id}>
								<CardContent className="py-4 flex items-center justify-between">
									<div>
										<p className="font-medium">{item.name}</p>
										<p className="text-sm text-muted-foreground">{item.code}</p>
									</div>
									<div className="flex gap-2">
										{item.taxable && <Badge variant="outline">Taxable</Badge>}
										{item.isRecurring && <Badge variant="secondary">Recurring</Badge>}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
				<div>
					<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
						<Minus className="h-5 w-5 text-red-600" />
						Deductions
					</h2>
					<div className="space-y-3">
						{deductions.map((item) => (
							<Card key={item.id}>
								<CardContent className="py-4 flex items-center justify-between">
									<div>
										<p className="font-medium">{item.name}</p>
										<p className="text-sm text-muted-foreground">{item.code}</p>
									</div>
									<div className="flex gap-2">
										{item.taxable && <Badge variant="outline">Taxable</Badge>}
										{item.isRecurring && <Badge variant="secondary">Recurring</Badge>}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

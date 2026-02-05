import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/ui/form";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CheckCircle2, FileText, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const payslipConfigSchema = z.object({
	showLogo: z.boolean(),
	showEmployerAddress: z.boolean(),
	showLeaveBalances: z.boolean(),
	showYtdTotals: z.boolean(),
	customFooterText: z.string(),
});

type PayslipConfigFormValues = z.infer<typeof payslipConfigSchema>;

export default function PayslipConfigPage() {
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery({
		queryKey: ["settings", "payslips"],
		queryFn: async () => {
			const response = await axios.get("/api/settings/payslips");
			return response.data.data as PayslipConfigFormValues;
		},
	});

	const form = useForm<PayslipConfigFormValues>({
		resolver: zodResolver(payslipConfigSchema),
		defaultValues: {
			showLogo: true,
			showEmployerAddress: true,
			showLeaveBalances: true,
			showYtdTotals: true,
			customFooterText: "",
		},
	});

	useEffect(() => {
		if (data) form.reset(data);
	}, [data, form]);

	const updateMutation = useMutation({
		mutationFn: async (values: PayslipConfigFormValues) => {
			const response = await axios.put("/api/settings/payslips", values);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings", "payslips"] });
			toast.success("Payslip configuration saved");
		},
	});

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
			<div>
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<FileText className="h-6 w-6" />
					Payslip Configuration
				</h1>
				<p className="text-muted-foreground">Customize payslip layout and content</p>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Display Options</CardTitle>
							<CardDescription>Control what appears on employee payslips</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="showLogo"
								render={({ field }) => (
									<FormItem className="flex items-center justify-between rounded-lg border p-3">
										<div>
											<FormLabel>Show Company Logo</FormLabel>
											<FormDescription>Display logo at the top of payslips</FormDescription>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="showEmployerAddress"
								render={({ field }) => (
									<FormItem className="flex items-center justify-between rounded-lg border p-3">
										<div>
											<FormLabel>Show Employer Address</FormLabel>
											<FormDescription>Include company address on payslips</FormDescription>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="showLeaveBalances"
								render={({ field }) => (
									<FormItem className="flex items-center justify-between rounded-lg border p-3">
										<div>
											<FormLabel>Show Leave Balances</FormLabel>
											<FormDescription>Display leave balances on payslips</FormDescription>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="showYtdTotals"
								render={({ field }) => (
									<FormItem className="flex items-center justify-between rounded-lg border p-3">
										<div>
											<FormLabel>Show Year-to-Date Totals</FormLabel>
											<FormDescription>Include YTD figures on payslips</FormDescription>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Custom Footer</CardTitle>
						</CardHeader>
						<CardContent>
							<FormField
								control={form.control}
								name="customFooterText"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Footer Text</FormLabel>
										<FormControl>
											<Textarea placeholder="Enter custom footer text..." {...field} />
										</FormControl>
										<FormDescription>This text will appear at the bottom of all payslips</FormDescription>
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<div className="flex justify-end">
						<Button type="submit" disabled={updateMutation.isPending}>
							{updateMutation.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : (
								<CheckCircle2 className="h-4 w-4 mr-2" />
							)}
							Save Changes
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Calculator, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const salaryRulesSchema = z.object({
	costToCompanyEnabled: z.boolean(),
	proRataMethod: z.enum(["calendar", "working_days"]),
	terminationPayMethod: z.enum(["immediate", "next_payrun"]),
	etiEnabled: z.boolean(),
	etiMaxAge: z.coerce.number().min(18).max(35),
	overtimeRate: z.coerce.number().min(1).max(3),
	sundayRate: z.coerce.number().min(1).max(3),
	publicHolidayRate: z.coerce.number().min(1).max(3),
});

type SalaryRulesFormValues = z.infer<typeof salaryRulesSchema>;

export default function SalaryRulesPage() {
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery({
		queryKey: ["settings", "salary-rules"],
		queryFn: async () => {
			const response = await axios.get("/api/settings/salary-rules");
			return response.data.data as SalaryRulesFormValues;
		},
	});

	const form = useForm<SalaryRulesFormValues>({
		resolver: zodResolver(salaryRulesSchema),
		defaultValues: {
			costToCompanyEnabled: false,
			proRataMethod: "calendar",
			terminationPayMethod: "next_payrun",
			etiEnabled: true,
			etiMaxAge: 29,
			overtimeRate: 1.5,
			sundayRate: 2.0,
			publicHolidayRate: 2.0,
		},
	});

	useEffect(() => {
		if (data) form.reset(data);
	}, [data, form]);

	const updateMutation = useMutation({
		mutationFn: async (values: SalaryRulesFormValues) => {
			const response = await axios.put("/api/settings/salary-rules", values);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings", "salary-rules"] });
			toast.success("Salary rules saved");
		},
	});

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div>
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<Calculator className="h-6 w-6" />
					Salary Rules
				</h1>
				<p className="text-muted-foreground">Configure global payroll calculation behavior</p>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Cost to Company</CardTitle>
							<CardDescription>Enable CTC-based salary calculations</CardDescription>
						</CardHeader>
						<CardContent>
							<FormField control={form.control} name="costToCompanyEnabled" render={({ field }) => (
								<FormItem className="flex items-center justify-between">
									<div>
										<FormLabel>Enable Cost to Company</FormLabel>
										<FormDescription>Calculate salaries based on total cost to company</FormDescription>
									</div>
									<FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
								</FormItem>
							)} />
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Pro-rata & Termination</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField control={form.control} name="proRataMethod" render={({ field }) => (
								<FormItem>
									<FormLabel>Pro-rata Calculation Method</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
										<SelectContent>
											<SelectItem value="calendar">Calendar Days</SelectItem>
											<SelectItem value="working_days">Working Days</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
							)} />
							<FormField control={form.control} name="terminationPayMethod" render={({ field }) => (
								<FormItem>
									<FormLabel>Termination Pay Processing</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
										<SelectContent>
											<SelectItem value="immediate">Immediate Payment</SelectItem>
											<SelectItem value="next_payrun">Next Payrun</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
							)} />
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>ETI (Employment Tax Incentive)</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField control={form.control} name="etiEnabled" render={({ field }) => (
								<FormItem className="flex items-center justify-between">
									<div>
										<FormLabel>Enable ETI</FormLabel>
										<FormDescription>Claim tax incentives for qualifying employees</FormDescription>
									</div>
									<FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
								</FormItem>
							)} />
							<FormField control={form.control} name="etiMaxAge" render={({ field }) => (
								<FormItem>
									<FormLabel>Maximum Age for ETI</FormLabel>
									<FormControl><Input type="number" {...field} className="w-24" /></FormControl>
								</FormItem>
							)} />
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Overtime Rates</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-3">
								<FormField control={form.control} name="overtimeRate" render={({ field }) => (
									<FormItem>
										<FormLabel>Overtime Rate</FormLabel>
										<FormControl><Input type="number" step="0.1" {...field} /></FormControl>
										<FormDescription>× normal rate</FormDescription>
									</FormItem>
								)} />
								<FormField control={form.control} name="sundayRate" render={({ field }) => (
									<FormItem>
										<FormLabel>Sunday Rate</FormLabel>
										<FormControl><Input type="number" step="0.1" {...field} /></FormControl>
										<FormDescription>× normal rate</FormDescription>
									</FormItem>
								)} />
								<FormField control={form.control} name="publicHolidayRate" render={({ field }) => (
									<FormItem>
										<FormLabel>Public Holiday Rate</FormLabel>
										<FormControl><Input type="number" step="0.1" {...field} /></FormControl>
										<FormDescription>× normal rate</FormDescription>
									</FormItem>
								)} />
							</div>
						</CardContent>
					</Card>

					<div className="flex justify-end">
						<Button type="submit" disabled={updateMutation.isPending}>
							{updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
							Save Changes
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

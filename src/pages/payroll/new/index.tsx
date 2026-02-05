import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Calculator, CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const payrunSchema = z.object({
	payFrequencyId: z.string().min(1, "Pay frequency is required"),
	payPeriodStart: z.string().min(1, "Period start is required"),
	payPeriodEnd: z.string().min(1, "Period end is required"),
	payDate: z.string().min(1, "Pay date is required"),
});

type PayrunFormValues = z.infer<typeof payrunSchema>;

export default function CreatePayrunPage() {
	const navigate = useNavigate();

	const form = useForm<PayrunFormValues>({
		resolver: zodResolver(payrunSchema),
		defaultValues: {
			payFrequencyId: "freq-1",
			payPeriodStart: "2026-02-01",
			payPeriodEnd: "2026-02-28",
			payDate: "2026-02-28",
		},
	});

	const createMutation = useMutation({
		mutationFn: async (data: PayrunFormValues) => {
			const response = await axios.post("/api/payruns", data);
			return response.data;
		},
		onSuccess: (data) => {
			toast.success("Payrun created");
			navigate(`/payroll/${data.data.id}`);
		},
		onError: () => {
			toast.error("Failed to create payrun");
		},
	});

	return (
		<div className="p-6 max-w-2xl mx-auto">
			<div className="mb-6">
				<Button variant="ghost" onClick={() => navigate("/payroll")}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Payroll
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5" />
						Create New Payrun
					</CardTitle>
					<CardDescription>Start a new payroll cycle for your employees</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-6">
							<FormField
								control={form.control}
								name="payFrequencyId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Pay Frequency *</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="freq-1">Monthly</SelectItem>
												<SelectItem value="freq-2">Weekly</SelectItem>
												<SelectItem value="freq-3">Fortnightly</SelectItem>
											</SelectContent>
										</Select>
										<FormDescription>Select the pay frequency for this payrun</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="payPeriodStart"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Period Start *</FormLabel>
											<FormControl>
												<Input type="date" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="payPeriodEnd"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Period End *</FormLabel>
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
								name="payDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Pay Date *</FormLabel>
										<FormControl>
											<Input type="date" {...field} />
										</FormControl>
										<FormDescription>Date when employees will be paid</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Card className="bg-muted/50">
								<CardContent className="pt-4">
									<p className="text-sm text-muted-foreground mb-2">Preview</p>
									<p className="font-medium">~25 employees will be included</p>
									<p className="text-sm text-muted-foreground">Based on active employees on selected pay frequency</p>
								</CardContent>
							</Card>

							<div className="flex justify-end gap-3">
								<Button type="button" variant="outline" onClick={() => navigate("/payroll")}>
									Cancel
								</Button>
								<Button type="submit" disabled={createMutation.isPending}>
									{createMutation.isPending ? (
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
									) : (
										<CheckCircle2 className="h-4 w-4 mr-2" />
									)}
									Create Payrun
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}

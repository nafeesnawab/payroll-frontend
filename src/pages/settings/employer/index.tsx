import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useAuthActions, useHasCompletedOnboarding } from "@/store/authStore";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const employerSchema = z.object({
	tradingName: z.string().optional(),
	registrationNumber: z.string().min(1, "Company registration number is required"),
	taxNumber: z.string().min(10, "Tax number must be at least 10 characters"),
	uifNumber: z.string().optional(),
	sdlNumber: z.string().optional(),
	payeNumber: z.string().optional(),
	physicalAddress: z.string().min(1, "Physical address is required"),
	postalAddress: z.string().optional(),
	contactPhone: z.string().min(10, "Contact phone is required"),
	contactEmail: z.string().email("Valid email is required"),
	financialYearEnd: z.string().min(1, "Financial year end is required"),
	payFrequency: z.string().min(1, "Pay frequency is required"),
});

type EmployerFormValues = z.infer<typeof employerSchema>;

export default function EmployerSettingsPage() {
	const navigate = useNavigate();
	const hasCompletedOnboarding = useHasCompletedOnboarding();
	const { setOnboardingComplete } = useAuthActions();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<EmployerFormValues>({
		resolver: zodResolver(employerSchema),
		defaultValues: {
			tradingName: "",
			registrationNumber: "",
			taxNumber: "",
			uifNumber: "",
			sdlNumber: "",
			payeNumber: "",
			physicalAddress: "",
			postalAddress: "",
			contactPhone: "",
			contactEmail: "",
			financialYearEnd: "",
			payFrequency: "monthly",
		},
	});

	const onSubmit = async (data: EmployerFormValues) => {
		setIsSubmitting(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log("Employer settings saved:", data);
			setOnboardingComplete(true);
			toast.success("Employer details saved successfully!");
			navigate("/dashboard", { replace: true });
		} catch {
			toast.error("Failed to save employer details");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container max-w-4xl py-8">
			{!hasCompletedOnboarding && (
				<div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
					<div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
						<Building2 className="h-5 w-5" />
						<span className="font-medium">Welcome! Let's set up your company details first.</span>
					</div>
					<p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
						This information is required for statutory compliance and payroll processing.
					</p>
				</div>
			)}

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Building2 className="h-5 w-5" />
						Employer Details
					</CardTitle>
					<CardDescription>
						Configure your company information for SARS compliance and payroll processing
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<div className="grid gap-6 md:grid-cols-2">
								<FormField
									control={form.control}
									name="tradingName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Trading Name (Optional)</FormLabel>
											<FormControl>
												<Input placeholder="Trading as..." {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="registrationNumber"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Company Registration Number *</FormLabel>
											<FormControl>
												<Input placeholder="2024/123456/07" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="taxNumber"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Income Tax Number *</FormLabel>
											<FormControl>
												<Input placeholder="9012345678" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="payeNumber"
									render={({ field }) => (
										<FormItem>
											<FormLabel>PAYE Reference Number</FormLabel>
											<FormControl>
												<Input placeholder="7012345678" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="uifNumber"
									render={({ field }) => (
										<FormItem>
											<FormLabel>UIF Reference Number</FormLabel>
											<FormControl>
												<Input placeholder="U123456789" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="sdlNumber"
									render={({ field }) => (
										<FormItem>
											<FormLabel>SDL Number</FormLabel>
											<FormControl>
												<Input placeholder="L123456789" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="border-t pt-6">
								<h3 className="text-lg font-medium mb-4">Contact Information</h3>
								<div className="grid gap-6 md:grid-cols-2">
									<FormField
										control={form.control}
										name="physicalAddress"
										render={({ field }) => (
											<FormItem className="md:col-span-2">
												<FormLabel>Physical Address *</FormLabel>
												<FormControl>
													<Input placeholder="123 Main Street, Johannesburg, 2000" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="postalAddress"
										render={({ field }) => (
											<FormItem className="md:col-span-2">
												<FormLabel>Postal Address</FormLabel>
												<FormControl>
													<Input placeholder="PO Box 123, Johannesburg, 2000" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="contactPhone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Contact Phone *</FormLabel>
												<FormControl>
													<Input placeholder="011 123 4567" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="contactEmail"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Contact Email *</FormLabel>
												<FormControl>
													<Input type="email" placeholder="payroll@company.co.za" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							<div className="border-t pt-6">
								<h3 className="text-lg font-medium mb-4">Payroll Configuration</h3>
								<div className="grid gap-6 md:grid-cols-2">
									<FormField
										control={form.control}
										name="financialYearEnd"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Financial Year End *</FormLabel>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select month" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="january">January</SelectItem>
														<SelectItem value="february">February</SelectItem>
														<SelectItem value="march">March</SelectItem>
														<SelectItem value="april">April</SelectItem>
														<SelectItem value="may">May</SelectItem>
														<SelectItem value="june">June</SelectItem>
														<SelectItem value="july">July</SelectItem>
														<SelectItem value="august">August</SelectItem>
														<SelectItem value="september">September</SelectItem>
														<SelectItem value="october">October</SelectItem>
														<SelectItem value="november">November</SelectItem>
														<SelectItem value="december">December</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="payFrequency"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Pay Frequency *</FormLabel>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select frequency" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="weekly">Weekly</SelectItem>
														<SelectItem value="fortnightly">Fortnightly</SelectItem>
														<SelectItem value="monthly">Monthly</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							<div className="flex justify-end gap-4 pt-4">
								{hasCompletedOnboarding && (
									<Button type="button" variant="outline" onClick={() => navigate(-1)}>
										Cancel
									</Button>
								)}
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : (
										<CheckCircle2 className="mr-2 h-4 w-4" />
									)}
									{hasCompletedOnboarding ? "Save Changes" : "Complete Setup"}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}

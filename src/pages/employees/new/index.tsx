import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";
import type { CreateEmployeeRequest } from "@/types/employee";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const steps = [
	{ id: 1, title: "Personal Details", description: "Basic information" },
	{ id: 2, title: "Employment", description: "Job details" },
	{ id: 3, title: "Pay Details", description: "Salary & bank" },
	{ id: 4, title: "Tax & Statutory", description: "Compliance" },
	{ id: 5, title: "Review", description: "Confirm & create" },
];

const employeeSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	idType: z.enum(["sa_id", "passport", "asylum", "refugee"]),
	idNumber: z.string().min(6, "ID number is required"),
	dateOfBirth: z.string().min(1, "Date of birth is required"),
	gender: z.enum(["male", "female", "other"]),
	email: z.string().email("Valid email required"),
	phone: z.string().min(10, "Phone number is required"),
	physicalAddress: z.string().min(1, "Address is required"),
	employeeNumber: z.string().optional(),
	employmentType: z.enum(["full_time", "part_time", "director", "contractor"]),
	startDate: z.string().min(1, "Start date is required"),
	payFrequencyId: z.string().min(1, "Pay frequency is required"),
	payPointId: z.string().min(1, "Pay point is required"),
	jobGradeId: z.string().min(1, "Job grade is required"),
	workingDaysPerWeek: z.coerce.number().min(1).max(7),
	workingHoursPerDay: z.coerce.number().min(1).max(24),
	salaryType: z.enum(["fixed", "hourly"]),
	salaryAmount: z.coerce.number().min(0),
	costToCompany: z.boolean(),
	overtimeEligible: z.boolean(),
	bankName: z.string().min(1, "Bank name is required"),
	bankAccountNumber: z.string().min(5, "Account number is required"),
	bankBranchCode: z.string().min(6, "Branch code is required"),
	bankAccountType: z.string().min(1, "Account type is required"),
	taxNumber: z.string().optional(),
	uifIncluded: z.boolean(),
	sdlIncluded: z.boolean(),
	etiEligible: z.boolean(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

export default function AddEmployeePage() {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(1);

	const form = useForm<EmployeeFormValues>({
		resolver: zodResolver(employeeSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			idType: "sa_id",
			idNumber: "",
			dateOfBirth: "",
			gender: "male",
			email: "",
			phone: "",
			physicalAddress: "",
			employeeNumber: "",
			employmentType: "full_time",
			startDate: new Date().toISOString().split("T")[0],
			payFrequencyId: "freq-1",
			payPointId: "pp-1",
			jobGradeId: "jg-2",
			workingDaysPerWeek: 5,
			workingHoursPerDay: 8,
			salaryType: "fixed",
			salaryAmount: 0,
			costToCompany: false,
			overtimeEligible: true,
			bankName: "",
			bankAccountNumber: "",
			bankBranchCode: "",
			bankAccountType: "current",
			taxNumber: "",
			uifIncluded: true,
			sdlIncluded: true,
			etiEligible: false,
		},
	});

	const createMutation = useMutation({
		mutationFn: async (data: CreateEmployeeRequest) => {
			const response = await axios.post("/api/employees", data);
			return response.data;
		},
		onSuccess: (data) => {
			toast.success("Employee created successfully");
			navigate(`/employees/${data.data.id}`);
		},
		onError: () => {
			toast.error("Failed to create employee");
		},
	});

	const nextStep = () => {
		if (currentStep < 5) setCurrentStep(currentStep + 1);
	};

	const prevStep = () => {
		if (currentStep > 1) setCurrentStep(currentStep - 1);
	};

	const onSubmit = (data: EmployeeFormValues) => {
		createMutation.mutate(data as CreateEmployeeRequest);
	};

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<div className="mb-6">
				<Button variant="ghost" onClick={() => navigate("/employees")}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Employees
				</Button>
			</div>

			<div className="mb-8">
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<User className="h-6 w-6" />
					Add New Employee
				</h1>
				<div className="flex gap-2 mt-4">
					{steps.map((step) => (
						<div key={step.id} className="flex-1">
							<div className={`h-2 rounded-full ${step.id <= currentStep ? "bg-primary" : "bg-muted"}`} />
							<p className={`text-xs mt-1 ${step.id === currentStep ? "font-medium" : "text-muted-foreground"}`}>
								{step.title}
							</p>
						</div>
					))}
				</div>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					{currentStep === 1 && (
						<Card>
							<CardHeader>
								<CardTitle>Personal Details</CardTitle>
								<CardDescription>Basic employee information</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="firstName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>First Name *</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="lastName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Last Name *</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="idType"
										render={({ field }) => (
											<FormItem>
												<FormLabel>ID Type *</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="sa_id">SA ID</SelectItem>
														<SelectItem value="passport">Passport</SelectItem>
														<SelectItem value="asylum">Asylum Seeker</SelectItem>
														<SelectItem value="refugee">Refugee</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="idNumber"
										render={({ field }) => (
											<FormItem>
												<FormLabel>ID Number *</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="dateOfBirth"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Date of Birth *</FormLabel>
												<FormControl>
													<Input type="date" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="gender"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Gender *</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="male">Male</SelectItem>
														<SelectItem value="female">Female</SelectItem>
														<SelectItem value="other">Other</SelectItem>
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
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email *</FormLabel>
												<FormControl>
													<Input type="email" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="phone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Phone *</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<FormField
									control={form.control}
									name="physicalAddress"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Physical Address *</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>
					)}

					{currentStep === 2 && (
						<Card>
							<CardHeader>
								<CardTitle>Employment Details</CardTitle>
								<CardDescription>Job and schedule information</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="employeeNumber"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Employee Number</FormLabel>
												<FormControl>
													<Input placeholder="Auto-generated if empty" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="employmentType"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Employment Type *</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="full_time">Full-time</SelectItem>
														<SelectItem value="part_time">Part-time (&lt;22 hrs)</SelectItem>
														<SelectItem value="director">Director</SelectItem>
														<SelectItem value="contractor">Contractor</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
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
								<div className="grid grid-cols-3 gap-4">
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
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="payPointId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Pay Point *</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="pp-1">Head Office</SelectItem>
														<SelectItem value="pp-2">Cape Town</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="jobGradeId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Job Grade *</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="jg-1">Junior</SelectItem>
														<SelectItem value="jg-2">Intermediate</SelectItem>
														<SelectItem value="jg-3">Senior</SelectItem>
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
										name="workingDaysPerWeek"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Working Days/Week *</FormLabel>
												<FormControl>
													<Input type="number" min={1} max={7} {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="workingHoursPerDay"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Working Hours/Day *</FormLabel>
												<FormControl>
													<Input type="number" min={1} max={24} {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>
					)}

					{currentStep === 3 && (
						<Card>
							<CardHeader>
								<CardTitle>Pay Details</CardTitle>
								<CardDescription>Salary and banking information</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="salaryType"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Salary Type *</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="fixed">Fixed Monthly</SelectItem>
														<SelectItem value="hourly">Hourly</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="salaryAmount"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Salary Amount (ZAR) *</FormLabel>
												<FormControl>
													<Input type="number" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="costToCompany"
										render={({ field }) => (
											<FormItem className="flex items-center justify-between rounded-lg border p-3">
												<FormLabel>Cost to Company</FormLabel>
												<FormControl>
													<Switch checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="overtimeEligible"
										render={({ field }) => (
											<FormItem className="flex items-center justify-between rounded-lg border p-3">
												<FormLabel>Overtime Eligible</FormLabel>
												<FormControl>
													<Switch checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
											</FormItem>
										)}
									/>
								</div>
								<div className="border-t pt-4">
									<h4 className="font-medium mb-4">Bank Details</h4>
									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="bankName"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Bank Name *</FormLabel>
													<Select onValueChange={field.onChange} value={field.value}>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select bank" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="Standard Bank">Standard Bank</SelectItem>
															<SelectItem value="FNB">FNB</SelectItem>
															<SelectItem value="ABSA">ABSA</SelectItem>
															<SelectItem value="Nedbank">Nedbank</SelectItem>
															<SelectItem value="Capitec">Capitec</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="bankAccountType"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Account Type *</FormLabel>
													<Select onValueChange={field.onChange} value={field.value}>
														<FormControl>
															<SelectTrigger>
																<SelectValue />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="current">Current</SelectItem>
															<SelectItem value="savings">Savings</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div className="grid grid-cols-2 gap-4 mt-4">
										<FormField
											control={form.control}
											name="bankAccountNumber"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Account Number *</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="bankBranchCode"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Branch Code *</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{currentStep === 4 && (
						<Card>
							<CardHeader>
								<CardTitle>Tax & Statutory</CardTitle>
								<CardDescription>Compliance and tax information</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<FormField
									control={form.control}
									name="taxNumber"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Tax Number</FormLabel>
											<FormControl>
												<Input placeholder="Optional" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className="grid grid-cols-3 gap-4">
									<FormField
										control={form.control}
										name="uifIncluded"
										render={({ field }) => (
											<FormItem className="flex items-center justify-between rounded-lg border p-3">
												<FormLabel>UIF Included</FormLabel>
												<FormControl>
													<Switch checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="sdlIncluded"
										render={({ field }) => (
											<FormItem className="flex items-center justify-between rounded-lg border p-3">
												<FormLabel>SDL Included</FormLabel>
												<FormControl>
													<Switch checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="etiEligible"
										render={({ field }) => (
											<FormItem className="flex items-center justify-between rounded-lg border p-3">
												<FormLabel>ETI Eligible</FormLabel>
												<FormControl>
													<Switch checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>
					)}

					{currentStep === 5 && (
						<Card>
							<CardHeader>
								<CardTitle>Review & Create</CardTitle>
								<CardDescription>Confirm employee details</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-2 gap-6">
									<div>
										<h4 className="font-medium mb-2">Personal</h4>
										<dl className="text-sm space-y-1">
											<div className="flex justify-between">
												<dt className="text-muted-foreground">Name</dt>
												<dd>
													{form.watch("firstName")} {form.watch("lastName")}
												</dd>
											</div>
											<div className="flex justify-between">
												<dt className="text-muted-foreground">ID</dt>
												<dd>{form.watch("idNumber")}</dd>
											</div>
											<div className="flex justify-between">
												<dt className="text-muted-foreground">Email</dt>
												<dd>{form.watch("email")}</dd>
											</div>
										</dl>
									</div>
									<div>
										<h4 className="font-medium mb-2">Employment</h4>
										<dl className="text-sm space-y-1">
											<div className="flex justify-between">
												<dt className="text-muted-foreground">Type</dt>
												<dd>
													<Badge variant="outline">{form.watch("employmentType")}</Badge>
												</dd>
											</div>
											<div className="flex justify-between">
												<dt className="text-muted-foreground">Start</dt>
												<dd>{form.watch("startDate")}</dd>
											</div>
											<div className="flex justify-between">
												<dt className="text-muted-foreground">Hours</dt>
												<dd>{form.watch("workingHoursPerDay")}h/day</dd>
											</div>
										</dl>
									</div>
									<div>
										<h4 className="font-medium mb-2">Pay</h4>
										<dl className="text-sm space-y-1">
											<div className="flex justify-between">
												<dt className="text-muted-foreground">Salary</dt>
												<dd className="font-medium">{formatCurrency(form.watch("salaryAmount"))}</dd>
											</div>
											<div className="flex justify-between">
												<dt className="text-muted-foreground">Type</dt>
												<dd>{form.watch("salaryType")}</dd>
											</div>
											<div className="flex justify-between">
												<dt className="text-muted-foreground">Bank</dt>
												<dd>{form.watch("bankName")}</dd>
											</div>
										</dl>
									</div>
									<div>
										<h4 className="font-medium mb-2">Statutory</h4>
										<dl className="text-sm space-y-1">
											<div className="flex justify-between">
												<dt className="text-muted-foreground">UIF</dt>
												<dd>{form.watch("uifIncluded") ? "Yes" : "No"}</dd>
											</div>
											<div className="flex justify-between">
												<dt className="text-muted-foreground">SDL</dt>
												<dd>{form.watch("sdlIncluded") ? "Yes" : "No"}</dd>
											</div>
											<div className="flex justify-between">
												<dt className="text-muted-foreground">ETI</dt>
												<dd>{form.watch("etiEligible") ? "Eligible" : "No"}</dd>
											</div>
										</dl>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					<div className="flex justify-between mt-6">
						<Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Previous
						</Button>
						{currentStep < 5 ? (
							<Button type="button" onClick={nextStep}>
								Next
								<ArrowRight className="h-4 w-4 ml-2" />
							</Button>
						) : (
							<Button type="submit" disabled={createMutation.isPending}>
								{createMutation.isPending ? (
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
								) : (
									<CheckCircle2 className="h-4 w-4 mr-2" />
								)}
								Create Employee
							</Button>
						)}
					</div>
				</form>
			</Form>
		</div>
	);
}

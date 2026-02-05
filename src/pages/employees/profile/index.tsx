import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import type { Employee, EmployeeLeaveBalance, EmployeePayslip, EmployeeHistoryItem } from "@/types/employee";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
	AlertCircle,
	ArrowLeft,
	Banknote,
	Briefcase,
	Calendar,
	CheckCircle2,
	Clock,
	FileText,
	History,
	Loader2,
	LogOut,
	RefreshCw,
	User,
	Wallet,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
	active: { label: "Active", variant: "default" },
	inactive: { label: "Inactive", variant: "secondary" },
	terminated: { label: "Terminated", variant: "destructive" },
};

const formatCurrency = (amount: number) =>
	new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);

const terminateSchema = z.object({
	terminationDate: z.string().min(1, "Date required"),
	reason: z.string().min(1, "Reason required"),
});

export default function EmployeeProfilePage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [terminateOpen, setTerminateOpen] = useState(false);

	const { data: employee, isLoading } = useQuery({
		queryKey: ["employee", id],
		queryFn: async () => {
			const response = await axios.get(`/api/employees/${id}`);
			return response.data.data as Employee;
		},
	});

	const { data: leaveBalances } = useQuery({
		queryKey: ["employee", id, "leave-balances"],
		queryFn: async () => {
			const response = await axios.get(`/api/employees/${id}/leave-balances`);
			return response.data.data as EmployeeLeaveBalance[];
		},
	});

	const { data: payslips } = useQuery({
		queryKey: ["employee", id, "payslips"],
		queryFn: async () => {
			const response = await axios.get(`/api/employees/${id}/payslips`);
			return response.data.data as EmployeePayslip[];
		},
	});

	const { data: history } = useQuery({
		queryKey: ["employee", id, "history"],
		queryFn: async () => {
			const response = await axios.get(`/api/employees/${id}/history`);
			return response.data.data as EmployeeHistoryItem[];
		},
	});

	const terminateForm = useForm({
		resolver: zodResolver(terminateSchema),
		defaultValues: { terminationDate: new Date().toISOString().split("T")[0], reason: "" },
	});

	const terminateMutation = useMutation({
		mutationFn: async (data: { terminationDate: string; reason: string }) => {
			return axios.post(`/api/employees/${id}/terminate`, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employee", id] });
			toast.success("Employee terminated");
			setTerminateOpen(false);
		},
	});

	const reinstateMutation = useMutation({
		mutationFn: async () => axios.post(`/api/employees/${id}/reinstate`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employee", id] });
			toast.success("Employee reinstated");
		},
	});

	if (isLoading) {
		return (
			<div className="p-6">
				<Skeleton className="h-8 w-48 mb-4" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (!employee) {
		return (
			<div className="p-6">
				<p className="text-muted-foreground">Employee not found</p>
			</div>
		);
	}

	const status = statusConfig[employee.status];

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => navigate("/employees")}>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div className="flex-1">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-bold">{employee.fullName}</h1>
						<Badge variant={status.variant}>{status.label}</Badge>
						{employee.hasErrors && (
							<Badge variant="destructive" className="gap-1">
								<AlertCircle className="h-3 w-3" />
								Errors
							</Badge>
						)}
					</div>
					<p className="text-muted-foreground">{employee.employeeNumber} • {employee.jobGradeName}</p>
				</div>
				<div className="flex gap-2">
					{employee.status === "terminated" ? (
						<Button variant="outline" onClick={() => reinstateMutation.mutate()} disabled={reinstateMutation.isPending}>
							{reinstateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
							Reinstate
						</Button>
					) : (
						<Dialog open={terminateOpen} onOpenChange={setTerminateOpen}>
							<DialogTrigger asChild>
								<Button variant="destructive">
									<LogOut className="h-4 w-4 mr-2" />
									Terminate
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Terminate Employee</DialogTitle>
								</DialogHeader>
								<Form {...terminateForm}>
									<form onSubmit={terminateForm.handleSubmit((data) => terminateMutation.mutate(data))} className="space-y-4">
										<FormField control={terminateForm.control} name="terminationDate" render={({ field }) => (
											<FormItem>
												<FormLabel>Termination Date *</FormLabel>
												<FormControl><Input type="date" {...field} /></FormControl>
												<FormMessage />
											</FormItem>
										)} />
										<FormField control={terminateForm.control} name="reason" render={({ field }) => (
											<FormItem>
												<FormLabel>Reason *</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl><SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger></FormControl>
													<SelectContent>
														<SelectItem value="resignation">Resignation</SelectItem>
														<SelectItem value="dismissal">Dismissal</SelectItem>
														<SelectItem value="retrenchment">Retrenchment</SelectItem>
														<SelectItem value="contract_end">Contract End</SelectItem>
														<SelectItem value="retirement">Retirement</SelectItem>
														<SelectItem value="death">Death</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)} />
										<div className="flex justify-end gap-2">
											<Button type="button" variant="outline" onClick={() => setTerminateOpen(false)}>Cancel</Button>
											<Button type="submit" variant="destructive" disabled={terminateMutation.isPending}>
												{terminateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
												Confirm
											</Button>
										</div>
									</form>
								</Form>
							</DialogContent>
						</Dialog>
					)}
				</div>
			</div>

			{employee.hasErrors && employee.errors && (
				<Card className="border-destructive bg-destructive/5">
					<CardContent className="py-4">
						<div className="flex items-center gap-2 text-destructive">
							<AlertCircle className="h-5 w-5" />
							<span className="font-medium">This employee has errors that need attention:</span>
						</div>
						<ul className="mt-2 ml-7 list-disc text-sm text-destructive">
							{employee.errors.map((error, i) => <li key={i}>{error}</li>)}
						</ul>
					</CardContent>
				</Card>
			)}

			<Tabs defaultValue="overview">
				<TabsList>
					<TabsTrigger value="overview"><User className="h-4 w-4 mr-2" />Overview</TabsTrigger>
					<TabsTrigger value="employment"><Briefcase className="h-4 w-4 mr-2" />Employment</TabsTrigger>
					<TabsTrigger value="pay"><Wallet className="h-4 w-4 mr-2" />Pay</TabsTrigger>
					<TabsTrigger value="leave"><Calendar className="h-4 w-4 mr-2" />Leave</TabsTrigger>
					<TabsTrigger value="payroll"><Banknote className="h-4 w-4 mr-2" />Payroll</TabsTrigger>
					<TabsTrigger value="history"><History className="h-4 w-4 mr-2" />History</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Personal Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3 text-sm">
								<div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{employee.email}</span></div>
								<div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{employee.phone}</span></div>
								<div className="flex justify-between"><span className="text-muted-foreground">ID Type</span><span className="uppercase">{employee.idType.replace("_", " ")}</span></div>
								<div className="flex justify-between"><span className="text-muted-foreground">ID Number</span><span>{employee.idNumber}</span></div>
								<div className="flex justify-between"><span className="text-muted-foreground">Date of Birth</span><span>{employee.dateOfBirth}</span></div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Current Salary</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-3xl font-bold">{formatCurrency(employee.salaryAmount)}</p>
								<p className="text-muted-foreground">{employee.salaryType === "fixed" ? "per month" : "per hour"}</p>
								{employee.costToCompany && <Badge variant="secondary" className="mt-2">Cost to Company</Badge>}
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Leave Balances</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{leaveBalances?.map((lb) => (
									<div key={lb.leaveTypeId} className="flex justify-between items-center">
										<span className="text-sm">{lb.leaveTypeName}</span>
										<Badge variant="outline">{lb.balance} days</Badge>
									</div>
								))}
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Latest Payslip</CardTitle>
							</CardHeader>
							<CardContent>
								{payslips && payslips[0] ? (
									<div className="space-y-2">
										<p className="text-sm text-muted-foreground">{payslips[0].period}</p>
										<p className="text-2xl font-bold">{formatCurrency(payslips[0].netPay)}</p>
										<p className="text-sm text-muted-foreground">Net pay</p>
									</div>
								) : (
									<p className="text-muted-foreground">No payslips yet</p>
								)}
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="employment" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Employment Details</CardTitle>
						</CardHeader>
						<CardContent className="grid gap-6 md:grid-cols-2">
							<div className="space-y-4">
								<div><p className="text-sm text-muted-foreground">Employment Type</p><p className="font-medium capitalize">{employee.employmentType.replace("_", " ")}</p></div>
								<div><p className="text-sm text-muted-foreground">Start Date</p><p className="font-medium">{employee.startDate}</p></div>
								<div><p className="text-sm text-muted-foreground">Job Grade</p><p className="font-medium">{employee.jobGradeName}</p></div>
							</div>
							<div className="space-y-4">
								<div><p className="text-sm text-muted-foreground">Pay Frequency</p><p className="font-medium">{employee.payFrequencyName}</p></div>
								<div><p className="text-sm text-muted-foreground">Pay Point</p><p className="font-medium">{employee.payPointName}</p></div>
								<div><p className="text-sm text-muted-foreground">Working Schedule</p><p className="font-medium">{employee.workingDaysPerWeek} days/week, {employee.workingHoursPerDay} hrs/day</p></div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="pay" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Salary Configuration</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div><p className="text-sm text-muted-foreground">Salary Type</p><p className="font-medium capitalize">{employee.salaryType}</p></div>
								<div><p className="text-sm text-muted-foreground">Amount</p><p className="text-2xl font-bold">{formatCurrency(employee.salaryAmount)}</p></div>
								<div className="flex gap-2">
									{employee.costToCompany && <Badge>CTC</Badge>}
									{employee.overtimeEligible && <Badge variant="outline">Overtime Eligible</Badge>}
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Bank Details</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div><p className="text-sm text-muted-foreground">Bank</p><p className="font-medium">{employee.bankName}</p></div>
								<div><p className="text-sm text-muted-foreground">Account Number</p><p className="font-medium font-mono">****{employee.bankAccountNumber.slice(-4)}</p></div>
								<div><p className="text-sm text-muted-foreground">Branch Code</p><p className="font-medium">{employee.bankBranchCode}</p></div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="leave" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Leave Balances</CardTitle>
							<CardDescription>Current leave entitlements and usage</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								{leaveBalances?.map((lb) => (
									<Card key={lb.leaveTypeId}>
										<CardContent className="pt-6">
											<p className="text-sm font-medium">{lb.leaveTypeName}</p>
											<p className="text-3xl font-bold mt-2">{lb.balance}</p>
											<p className="text-sm text-muted-foreground">days available</p>
											<div className="mt-4 text-xs text-muted-foreground space-y-1">
												<div className="flex justify-between"><span>Entitled</span><span>{lb.entitled}</span></div>
												<div className="flex justify-between"><span>Taken</span><span>{lb.taken}</span></div>
												<div className="flex justify-between"><span>Pending</span><span>{lb.pending}</span></div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="payroll" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Payslip History</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{payslips?.map((ps) => (
									<div key={ps.id} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="flex items-center gap-4">
											<FileText className="h-5 w-5 text-muted-foreground" />
											<div>
												<p className="font-medium">{ps.period}</p>
												<p className="text-sm text-muted-foreground">Paid {ps.paidAt}</p>
											</div>
										</div>
										<div className="text-right">
											<p className="font-bold">{formatCurrency(ps.netPay)}</p>
											<p className="text-sm text-muted-foreground">Net pay</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="history" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Activity History</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{history?.map((h) => (
									<div key={h.id} className="flex gap-4 pb-4 border-b last:border-0">
										<div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
											<Clock className="h-4 w-4 text-muted-foreground" />
										</div>
										<div>
											<p className="font-medium">{h.action}</p>
											<p className="text-sm text-muted-foreground">{h.description}</p>
											<p className="text-xs text-muted-foreground mt-1">By {h.performedBy} • {h.performedAt}</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}

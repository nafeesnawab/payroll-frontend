import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import type { Payrun, PayrunEmployee, PayrunSummary } from "@/types/payroll";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
	AlertCircle,
	ArrowLeft,
	Calculator,
	CheckCircle2,
	Download,
	FileText,
	Loader2,
	Lock,
	RefreshCw,
	Search,
	Trash2,
	Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
	draft: { label: "Draft", variant: "secondary" },
	calculating: { label: "Calculating", variant: "outline" },
	ready: { label: "Ready", variant: "default" },
	finalized: { label: "Finalized", variant: "outline" },
};

const formatCurrency = (amount: number) =>
	new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(amount);

export default function PayrunDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [finalizeOpen, setFinalizeOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const { data: payrun, isLoading } = useQuery({
		queryKey: ["payrun", id],
		queryFn: async () => {
			const response = await axios.get(`/api/payruns/${id}`);
			return response.data.data as Payrun;
		},
	});

	const { data: employees } = useQuery({
		queryKey: ["payrun", id, "employees"],
		queryFn: async () => {
			const response = await axios.get(`/api/payruns/${id}/employees`);
			return response.data.data as PayrunEmployee[];
		},
	});

	const { data: summary } = useQuery({
		queryKey: ["payrun", id, "summary"],
		queryFn: async () => {
			const response = await axios.get(`/api/payruns/${id}/summary`);
			return response.data.data as PayrunSummary;
		},
	});

	const calculateMutation = useMutation({
		mutationFn: async () => axios.post(`/api/payruns/${id}/calculate`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payrun", id] });
			toast.success("Payroll calculated successfully");
		},
	});

	const finalizeMutation = useMutation({
		mutationFn: async () => axios.post(`/api/payruns/${id}/finalize`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payrun", id] });
			setFinalizeOpen(false);
			toast.success("Payroll finalized");
		},
		onError: () => {
			toast.error("Cannot finalize with employee errors");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async () => axios.delete(`/api/payruns/${id}`),
		onSuccess: () => {
			toast.success("Payrun deleted");
			navigate("/payroll");
		},
	});

	const filteredEmployees = employees?.filter(
		(e) => e.employeeName.toLowerCase().includes(search.toLowerCase()) || e.employeeNumber.includes(search)
	);

	if (isLoading) {
		return (
			<div className="p-6">
				<Skeleton className="h-8 w-48 mb-4" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (!payrun) {
		return <div className="p-6 text-muted-foreground">Payrun not found</div>;
	}

	const status = statusConfig[payrun.status];
	const isFinalized = payrun.status === "finalized";
	const hasErrors = (payrun.employeesWithErrors ?? 0) > 0;

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => navigate("/payroll")}>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div className="flex-1">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-bold">{payrun.payPeriod}</h1>
						<Badge variant={status.variant}>{status.label}</Badge>
						{isFinalized && <Lock className="h-4 w-4 text-muted-foreground" />}
					</div>
					<p className="text-muted-foreground">
						{payrun.payFrequencyName} • Pay date: {payrun.payDate}
					</p>
				</div>
				<div className="flex gap-2">
					{!isFinalized && (
						<>
							<Button variant="outline" onClick={() => calculateMutation.mutate()} disabled={calculateMutation.isPending}>
								{calculateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
								Calculate
							</Button>
							<Dialog open={finalizeOpen} onOpenChange={setFinalizeOpen}>
								<DialogTrigger asChild>
									<Button disabled={hasErrors || payrun.status === "draft"}>
										<CheckCircle2 className="h-4 w-4 mr-2" />
										Finalize
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Finalize Payroll</DialogTitle>
										<DialogDescription>
											This action cannot be undone. Payslips will be locked and EFT files generated.
										</DialogDescription>
									</DialogHeader>
									<div className="flex justify-end gap-2 mt-4">
										<Button variant="outline" onClick={() => setFinalizeOpen(false)}>Cancel</Button>
										<Button onClick={() => finalizeMutation.mutate()} disabled={finalizeMutation.isPending}>
											{finalizeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
											Confirm Finalize
										</Button>
									</div>
								</DialogContent>
							</Dialog>
							<Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
								<DialogTrigger asChild>
									<Button variant="destructive" size="icon">
										<Trash2 className="h-4 w-4" />
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Delete Payrun</DialogTitle>
										<DialogDescription>Are you sure? This cannot be undone.</DialogDescription>
									</DialogHeader>
									<div className="flex justify-end gap-2 mt-4">
										<Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
										<Button variant="destructive" onClick={() => deleteMutation.mutate()}>Delete</Button>
									</div>
								</DialogContent>
							</Dialog>
						</>
					)}
				</div>
			</div>

			{hasErrors && (
				<Card className="border-destructive bg-destructive/5">
					<CardContent className="py-4 flex items-center gap-3">
						<AlertCircle className="h-5 w-5 text-destructive" />
						<span className="text-destructive font-medium">
							{payrun.employeesWithErrors} employee(s) have errors that must be resolved before finalizing
						</span>
					</CardContent>
				</Card>
			)}

			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Total Gross</CardDescription>
						<CardTitle className="text-2xl">{formatCurrency(payrun.totalGross)}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Total Deductions</CardDescription>
						<CardTitle className="text-2xl">{formatCurrency(payrun.totalDeductions)}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Total Net</CardDescription>
						<CardTitle className="text-2xl text-primary">{formatCurrency(payrun.totalNet)}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Employees</CardDescription>
						<CardTitle className="text-2xl flex items-center gap-2">
							{payrun.employeeCount}
							{hasErrors && <Badge variant="destructive">{payrun.employeesWithErrors} errors</Badge>}
						</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<Tabs defaultValue="employees">
				<TabsList>
					<TabsTrigger value="employees"><Users className="h-4 w-4 mr-2" />Employees</TabsTrigger>
					<TabsTrigger value="summary"><Calculator className="h-4 w-4 mr-2" />Summary</TabsTrigger>
					<TabsTrigger value="exports"><Download className="h-4 w-4 mr-2" />Exports</TabsTrigger>
				</TabsList>

				<TabsContent value="employees" className="mt-6">
					<Card>
						<CardContent className="pt-6">
							<div className="flex gap-4 mb-4">
								<div className="relative flex-1 max-w-sm">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input placeholder="Search employees..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
								</div>
							</div>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Employee</TableHead>
										<TableHead className="text-right">Gross</TableHead>
										<TableHead className="text-right">Deductions</TableHead>
										<TableHead className="text-right">Net</TableHead>
										<TableHead className="w-12"></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredEmployees?.map((emp) => (
										<TableRow key={emp.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/payroll/${id}/payslip/${emp.employeeId}`)}>
											<TableCell>
												<div>
													<p className="font-medium">{emp.employeeName}</p>
													<p className="text-sm text-muted-foreground">{emp.employeeNumber}</p>
												</div>
											</TableCell>
											<TableCell className="text-right font-mono">{formatCurrency(emp.grossPay)}</TableCell>
											<TableCell className="text-right font-mono">{formatCurrency(emp.totalDeductions)}</TableCell>
											<TableCell className="text-right font-mono font-medium">{formatCurrency(emp.netPay)}</TableCell>
											<TableCell>{emp.hasErrors && <AlertCircle className="h-4 w-4 text-destructive" />}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="summary" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Payroll Summary</CardTitle>
						</CardHeader>
						<CardContent>
							{summary && (
								<div className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div className="p-4 border rounded-lg">
											<p className="text-sm text-muted-foreground">Total Gross Pay</p>
											<p className="text-2xl font-bold">{formatCurrency(summary.totalGross)}</p>
										</div>
										<div className="p-4 border rounded-lg">
											<p className="text-sm text-muted-foreground">Total Net Pay</p>
											<p className="text-2xl font-bold text-primary">{formatCurrency(summary.totalNet)}</p>
										</div>
									</div>
									<div className="border-t pt-4">
										<h4 className="font-medium mb-3">Statutory Deductions</h4>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between"><span>PAYE</span><span className="font-mono">{formatCurrency(summary.totalPAYE)}</span></div>
											<div className="flex justify-between"><span>UIF (Employee)</span><span className="font-mono">{formatCurrency(summary.totalUIF)}</span></div>
											<div className="flex justify-between"><span>SDL</span><span className="font-mono">{formatCurrency(summary.totalSDL)}</span></div>
										</div>
									</div>
									<div className="border-t pt-4">
										<h4 className="font-medium mb-3">Employer Contributions</h4>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between"><span>UIF (Employer)</span><span className="font-mono">{formatCurrency(summary.employerUIF)}</span></div>
											<div className="flex justify-between"><span>SDL (Employer)</span><span className="font-mono">{formatCurrency(summary.employerSDL)}</span></div>
										</div>
									</div>
									<div className="border-t pt-4">
										<div className="flex justify-between text-lg font-bold">
											<span>Total Cost to Company</span>
											<span>{formatCurrency(summary.totalCostToCompany)}</span>
										</div>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="exports" className="mt-6">
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Payslips</CardTitle>
								<CardDescription>Download all payslips as PDF</CardDescription>
							</CardHeader>
							<CardContent>
								<Button variant="outline" disabled={!isFinalized}>
									<Download className="h-4 w-4 mr-2" />
									Download Payslips
								</Button>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" />EFT File</CardTitle>
								<CardDescription>Bank payment file</CardDescription>
							</CardHeader>
							<CardContent>
								<Button variant="outline" disabled={!isFinalized}>
									<Download className="h-4 w-4 mr-2" />
									Download EFT
								</Button>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}

import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import type { EMP501, EMP501Detail } from "@/types/filing";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, ArrowLeft, Download, FileSpreadsheet, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
	draft: { label: "Draft", variant: "secondary" },
	ready: { label: "Ready", variant: "outline" },
	submitted: { label: "Submitted", variant: "default" },
	accepted: { label: "Accepted", variant: "default" },
	rejected: { label: "Rejected", variant: "destructive" },
};

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);
}

export default function EMP501Page() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

	const { data: emp501List, isLoading: listLoading } = useQuery({
		queryKey: ["emp501-list"],
		queryFn: async () => {
			const response = await axios.get("/api/filings/emp501");
			return response.data.data as EMP501[];
		},
	});

	const { data: detail, isLoading: detailLoading } = useQuery({
		queryKey: ["emp501-detail", selectedId],
		queryFn: async () => {
			if (!selectedId) return null;
			const response = await axios.get(`/api/filings/emp501/${selectedId}`);
			return response.data.data as EMP501Detail;
		},
		enabled: !!selectedId,
	});

	const generateMutation = useMutation({
		mutationFn: async () => axios.post("/api/filings/emp501/generate"),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["emp501-list"] });
			setGenerateDialogOpen(false);
			toast.success("EMP501 generated successfully");
		},
	});

	const currentEmp501 = emp501List?.[0];
	const hasVariances = detail?.employees.some((e) => e.hasMismatch);

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => navigate("/filings")}>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold flex items-center gap-2">
							<FileSpreadsheet className="h-6 w-6" />
							EMP501 Reconciliation
						</h1>
						<p className="text-muted-foreground">Bi-annual payroll reconciliation with SARS</p>
					</div>
				</div>
				<Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<RefreshCw className="h-4 w-4 mr-2" />
							Generate EMP501
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Generate EMP501</DialogTitle>
							<DialogDescription>
								Generate a new EMP501 reconciliation for the current tax period. This will compile all payroll and EMP201 data.
							</DialogDescription>
						</DialogHeader>
						<div className="flex justify-end gap-2 mt-4">
							<Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
							<Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
								{generateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
								Generate
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<div className="flex gap-4">
				<Select value={selectedId || ""} onValueChange={setSelectedId}>
					<SelectTrigger className="w-64">
						<SelectValue placeholder="Select tax period" />
					</SelectTrigger>
					<SelectContent>
						{emp501List?.map((emp) => (
							<SelectItem key={emp.id} value={emp.id}>
								{emp.taxYear} - {emp.type === "interim" ? "Interim" : "Final"}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{listLoading ? (
				<div className="grid gap-4 md:grid-cols-3">
					{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
				</div>
			) : currentEmp501 && !selectedId ? (
				<Card className="cursor-pointer hover:border-primary" onClick={() => setSelectedId(currentEmp501.id)}>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>{currentEmp501.taxYear} - {currentEmp501.type === "interim" ? "Interim" : "Final"}</CardTitle>
							<Badge variant={statusConfig[currentEmp501.status].variant}>
								{statusConfig[currentEmp501.status].label}
							</Badge>
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-3 gap-4 text-center">
							<div>
								<p className="text-sm text-muted-foreground">Payroll PAYE</p>
								<p className="text-xl font-bold">{formatCurrency(currentEmp501.payrollTotalPaye)}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">EMP201 PAYE</p>
								<p className="text-xl font-bold">{formatCurrency(currentEmp501.emp201TotalPaye)}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Variance</p>
								<p className={`text-xl font-bold ${currentEmp501.variance !== 0 ? "text-destructive" : "text-green-600"}`}>
									{formatCurrency(currentEmp501.variance)}
								</p>
							</div>
						</div>
						<p className="text-sm text-muted-foreground mt-4 text-center">
							{currentEmp501.employeeCount} employees • Click to view details
						</p>
					</CardContent>
				</Card>
			) : null}

			{selectedId && detailLoading && (
				<div className="space-y-4">
					<Skeleton className="h-32" />
					<Skeleton className="h-64" />
				</div>
			)}

			{detail && (
				<>
					{hasVariances && (
						<Alert>
							<AlertTriangle className="h-4 w-4" />
							<AlertTitle>Variances Detected</AlertTitle>
							<AlertDescription>
								Some employees have PAYE variances between payroll and EMP201 submissions. Review and resolve before submitting.
							</AlertDescription>
						</Alert>
					)}

					<div className="grid gap-4 md:grid-cols-3">
						<Card>
							<CardHeader className="pb-2">
								<CardDescription>Payroll Total PAYE</CardDescription>
								<CardTitle className="text-2xl">{formatCurrency(detail.payrollTotalPaye)}</CardTitle>
							</CardHeader>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardDescription>EMP201 Total PAYE</CardDescription>
								<CardTitle className="text-2xl">{formatCurrency(detail.emp201TotalPaye)}</CardTitle>
							</CardHeader>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardDescription>Variance</CardDescription>
								<CardTitle className={`text-2xl ${detail.variance !== 0 ? "text-destructive" : "text-green-600"}`}>
									{formatCurrency(detail.variance)}
								</CardTitle>
							</CardHeader>
						</Card>
					</div>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Employee Reconciliation</CardTitle>
								<CardDescription>{detail.employeeCount} employees</CardDescription>
							</div>
							<Button variant="outline">
								<Download className="h-4 w-4 mr-2" />
								Export
							</Button>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Employee</TableHead>
										<TableHead>Tax Number</TableHead>
										<TableHead className="text-right">Payroll PAYE</TableHead>
										<TableHead className="text-right">EMP201 PAYE</TableHead>
										<TableHead className="text-right">Variance</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{detail.employees.map((emp) => (
										<TableRow key={emp.employeeId} className={emp.hasMismatch ? "bg-destructive/5" : ""}>
											<TableCell>
												<div>
													<p className="font-medium">{emp.employeeName}</p>
													<p className="text-sm text-muted-foreground">{emp.employeeNumber}</p>
												</div>
											</TableCell>
											<TableCell className="font-mono">{emp.taxNumber}</TableCell>
											<TableCell className="text-right font-mono">{formatCurrency(emp.payrollPaye)}</TableCell>
											<TableCell className="text-right font-mono">{formatCurrency(emp.emp201Paye)}</TableCell>
											<TableCell className={`text-right font-mono ${emp.hasMismatch ? "text-destructive font-bold" : ""}`}>
												{formatCurrency(emp.variance)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>EMP201 Periods</CardTitle>
							<CardDescription>Monthly declarations included in reconciliation</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Period</TableHead>
										<TableHead className="text-right">PAYE</TableHead>
										<TableHead className="text-right">UIF</TableHead>
										<TableHead className="text-right">SDL</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{detail.emp201Periods.map((p) => (
										<TableRow key={p.period}>
											<TableCell className="font-medium">{p.period}</TableCell>
											<TableCell className="text-right font-mono">{formatCurrency(p.paye)}</TableCell>
											<TableCell className="text-right font-mono">{formatCurrency(p.uif)}</TableCell>
											<TableCell className="text-right font-mono">{formatCurrency(p.sdl)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}

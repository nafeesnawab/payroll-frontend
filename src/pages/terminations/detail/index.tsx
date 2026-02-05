import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, ArrowLeft, Check, Clock, Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import type { TerminationDetail } from "@/types/termination";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
	draft: { label: "Draft", variant: "secondary" },
	pending_payroll: { label: "Pending Payroll", variant: "outline" },
	completed: { label: "Completed", variant: "default" },
};

const reasonLabels: Record<string, string> = {
	resignation: "Resignation",
	dismissal: "Dismissal",
	retrenchment: "Retrenchment",
	contract_end: "Contract End",
	death: "Death",
};

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);
}

export default function TerminationDetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("pay");
	const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false);

	const { data: detail, isLoading } = useQuery({
		queryKey: ["termination-detail", id],
		queryFn: async () => {
			const response = await axios.get(`/api/terminations/${id}`);
			return response.data.data as TerminationDetail;
		},
	});

	const savePayMutation = useMutation({
		mutationFn: async () => axios.put(`/api/terminations/${id}/pay`, {}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["termination-detail", id] });
			toast.success("Pay components saved");
			setActiveTab("preview");
		},
	});

	const finalizeMutation = useMutation({
		mutationFn: async () => axios.post(`/api/terminations/${id}/finalize`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["termination-detail", id] });
			queryClient.invalidateQueries({ queryKey: ["terminations"] });
			setFinalizeDialogOpen(false);
			toast.success("Termination finalized");
		},
	});

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-10 w-64" />
				<Skeleton className="h-64" />
			</div>
		);
	}

	if (!detail) {
		return <div className="p-6">Termination not found</div>;
	}

	const status = statusConfig[detail.status];
	const isCompleted = detail.status === "completed";
	const { payComponents } = detail;

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => navigate("/terminations")}>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold">{detail.employeeName}</h1>
						<p className="text-muted-foreground">
							{detail.employeeNumber} • {reasonLabels[detail.reason]}
						</p>
					</div>
				</div>
				<Badge variant={status.variant} className="text-sm px-3 py-1">
					{status.label}
				</Badge>
			</div>

			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Termination Date</CardDescription>
						<CardTitle>{detail.terminationDate}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Last Working Day</CardDescription>
						<CardTitle>{detail.lastWorkingDay}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Notice Period</CardDescription>
						<CardTitle>
							{detail.noticePeriodDays} days {detail.paidInLieu ? "(Paid in Lieu)" : ""}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Net Pay</CardDescription>
						<CardTitle className="text-green-600">{formatCurrency(payComponents.summary.netPay)}</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="pay">Pay Components</TabsTrigger>
					<TabsTrigger value="preview">Preview</TabsTrigger>
					<TabsTrigger value="documents" disabled={!isCompleted}>
						Documents
					</TabsTrigger>
					<TabsTrigger value="audit">Audit Log</TabsTrigger>
				</TabsList>

				<TabsContent value="pay" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Earnings</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<label className="text-sm font-medium">Final Salary</label>
									<Input type="number" defaultValue={payComponents.earnings.finalSalary} disabled={isCompleted} />
								</div>
								<div>
									<label className="text-sm font-medium">Notice Pay</label>
									<Input type="number" defaultValue={payComponents.earnings.noticePay} disabled={isCompleted} />
								</div>
								<div>
									<label className="text-sm font-medium">Severance Pay</label>
									<Input type="number" defaultValue={payComponents.earnings.severancePay} disabled={isCompleted} />
								</div>
								<div>
									<label className="text-sm font-medium">Pro-Rata Earnings</label>
									<Input type="number" defaultValue={payComponents.earnings.proRataEarnings} disabled={isCompleted} />
								</div>
							</div>
							<div className="border-t pt-4">
								<div className="flex justify-between items-center">
									<div>
										<p className="font-medium">Leave Payout</p>
										<p className="text-sm text-muted-foreground">{payComponents.earnings.leavePayoutDays} days</p>
									</div>
									<p className="text-lg font-bold">{formatCurrency(payComponents.earnings.leavePayoutAmount)}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Deductions</CardTitle>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Deduction</TableHead>
										<TableHead className="text-right">Amount</TableHead>
										<TableHead className="text-center">Skip</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{payComponents.deductions.map((ded) => (
										<TableRow key={ded.id}>
											<TableCell>{ded.name}</TableCell>
											<TableCell className="text-right font-mono">{formatCurrency(ded.amount)}</TableCell>
											<TableCell className="text-center">
												<Switch defaultChecked={ded.skip} disabled={isCompleted || ded.name === "PAYE"} />
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Summary</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span>Gross Pay</span>
									<span className="font-mono">{formatCurrency(payComponents.summary.grossPay)}</span>
								</div>
								<div className="flex justify-between text-muted-foreground">
									<span>Total Deductions</span>
									<span className="font-mono">-{formatCurrency(payComponents.summary.totalDeductions)}</span>
								</div>
								<div className="flex justify-between text-lg font-bold border-t pt-2">
									<span>Net Pay</span>
									<span className="text-green-600">{formatCurrency(payComponents.summary.netPay)}</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{!isCompleted && (
						<div className="flex justify-end">
							<Button onClick={() => savePayMutation.mutate()} disabled={savePayMutation.isPending}>
								{savePayMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
								Save & Continue
							</Button>
						</div>
					)}
				</TabsContent>

				<TabsContent value="preview" className="space-y-4">
					<Alert>
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>Review Final Payslip</AlertTitle>
						<AlertDescription>Verify all amounts before finalizing the termination.</AlertDescription>
					</Alert>

					<Card>
						<CardHeader className="text-center border-b">
							<CardTitle>Final Payslip</CardTitle>
							<CardDescription>
								{detail.employeeName} • {detail.terminationDate}
							</CardDescription>
						</CardHeader>
						<CardContent className="p-6">
							<div className="grid md:grid-cols-2 gap-8">
								<div>
									<h4 className="font-semibold mb-3">Earnings</h4>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span>Final Salary</span>
											<span>{formatCurrency(payComponents.earnings.finalSalary)}</span>
										</div>
										<div className="flex justify-between">
											<span>Notice Pay</span>
											<span>{formatCurrency(payComponents.earnings.noticePay)}</span>
										</div>
										<div className="flex justify-between">
											<span>Severance Pay</span>
											<span>{formatCurrency(payComponents.earnings.severancePay)}</span>
										</div>
										<div className="flex justify-between">
											<span>Leave Payout</span>
											<span>{formatCurrency(payComponents.earnings.leavePayoutAmount)}</span>
										</div>
										<div className="flex justify-between font-bold border-t pt-2">
											<span>Gross</span>
											<span>{formatCurrency(payComponents.summary.grossPay)}</span>
										</div>
									</div>
								</div>
								<div>
									<h4 className="font-semibold mb-3">Deductions</h4>
									<div className="space-y-2 text-sm">
										{payComponents.deductions
											.filter((d) => !d.skip)
											.map((d) => (
												<div key={d.id} className="flex justify-between">
													<span>{d.name}</span>
													<span>{formatCurrency(d.amount)}</span>
												</div>
											))}
										<div className="flex justify-between font-bold border-t pt-2">
											<span>Total</span>
											<span>{formatCurrency(payComponents.summary.totalDeductions)}</span>
										</div>
									</div>
								</div>
							</div>
							<div className="mt-6 pt-4 border-t text-center">
								<p className="text-sm text-muted-foreground">Net Pay</p>
								<p className="text-3xl font-bold text-green-600">{formatCurrency(payComponents.summary.netPay)}</p>
							</div>
						</CardContent>
					</Card>

					{!isCompleted && (
						<div className="flex justify-end">
							<Dialog open={finalizeDialogOpen} onOpenChange={setFinalizeDialogOpen}>
								<DialogTrigger asChild>
									<Button>Finalize Termination</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Finalize Termination</DialogTitle>
										<DialogDescription>
											This will generate the final payslip, close leave balances, create UIF declarations, and set the
											employee as inactive. This action cannot be undone.
										</DialogDescription>
									</DialogHeader>
									<div className="flex justify-end gap-2 mt-4">
										<Button variant="outline" onClick={() => setFinalizeDialogOpen(false)}>
											Cancel
										</Button>
										<Button
											variant="destructive"
											onClick={() => finalizeMutation.mutate()}
											disabled={finalizeMutation.isPending}
										>
											{finalizeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
											Confirm Finalization
										</Button>
									</div>
								</DialogContent>
							</Dialog>
						</div>
					)}
				</TabsContent>

				<TabsContent value="documents">
					<Card>
						<CardHeader>
							<CardTitle>Termination Documents</CardTitle>
						</CardHeader>
						<CardContent>
							{detail.documents.length > 0 ? (
								<div className="space-y-3">
									{detail.documents.map((doc) => (
										<div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
											<div className="flex items-center gap-3">
												<FileText className="h-5 w-5 text-muted-foreground" />
												<div>
													<p className="font-medium">{doc.name}</p>
													<p className="text-sm text-muted-foreground">
														{new Date(doc.generatedAt).toLocaleDateString()}
													</p>
												</div>
											</div>
											<Button variant="outline" size="sm">
												<Download className="h-4 w-4 mr-2" />
												Download
											</Button>
										</div>
									))}
								</div>
							) : (
								<p className="text-muted-foreground text-center py-8">Documents will be available after finalization</p>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="audit">
					<Card>
						<CardHeader>
							<CardTitle>Audit Log</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{detail.auditLog.map((entry) => (
									<div key={entry.id} className="flex items-start gap-3">
										<div className="mt-0.5">
											{entry.action.includes("Finalized") ? (
												<Check className="h-4 w-4 text-green-600" />
											) : (
												<Clock className="h-4 w-4 text-muted-foreground" />
											)}
										</div>
										<div>
											<p className="font-medium">{entry.action}</p>
											<p className="text-sm text-muted-foreground">
												{entry.user} • {new Date(entry.timestamp).toLocaleString()}
											</p>
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

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";
import type { EmployeePayslip } from "@/types/payroll";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AlertCircle, ArrowLeft, FileText, Loader2, Minus, Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const formatCurrency = (amount: number) =>
	new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);

export default function PayslipDetailPage() {
	const { id, employeeId } = useParams<{ id: string; employeeId: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const [earnings, setEarnings] = useState<EmployeePayslip["earnings"]>([]);
	const [deductions, setDeductions] = useState<EmployeePayslip["deductions"]>([]);

	const { data: payslip, isLoading } = useQuery({
		queryKey: ["payslip", id, employeeId],
		queryFn: async () => {
			const response = await axios.get(`/api/payruns/${id}/payslip/${employeeId}`);
			return response.data.data as EmployeePayslip;
		},
	});

	useEffect(() => {
		if (payslip) {
			setEarnings(payslip.earnings);
			setDeductions(payslip.deductions);
		}
	}, [payslip]);

	const saveMutation = useMutation({
		mutationFn: async () => {
			return axios.put(`/api/payruns/${id}/payslip/${employeeId}`, { earnings, deductions });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payslip", id, employeeId] });
			toast.success("Payslip saved");
		},
	});

	const updateEarning = (earningId: string, field: string, value: number | string) => {
		setEarnings((prev) =>
			prev.map((e) => (e.id === earningId ? { ...e, [field]: value } : e))
		);
	};

	const updateDeduction = (deductionId: string, field: string, value: number | string | boolean) => {
		setDeductions((prev) =>
			prev.map((d) => (d.id === deductionId ? { ...d, [field]: value } : d))
		);
	};

	const grossPay = earnings.reduce((sum, e) => sum + e.amount, 0);
	const totalDeductions = deductions.filter((d) => !d.isSkipped).reduce((sum, d) => sum + d.amount, 0);
	const netPay = grossPay - totalDeductions;
	const isNegative = netPay < 0;

	if (isLoading) {
		return (
			<div className="p-6">
				<Skeleton className="h-8 w-48 mb-4" />
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	if (!payslip) {
		return <div className="p-6 text-muted-foreground">Payslip not found</div>;
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => navigate(`/payroll/${id}`)}>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div className="flex-1">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-bold">{payslip.employeeName}</h1>
						{payslip.hasErrors && (
							<Badge variant="destructive" className="gap-1">
								<AlertCircle className="h-3 w-3" />
								Errors
							</Badge>
						)}
					</div>
					<p className="text-muted-foreground">
						{payslip.employeeNumber} • {payslip.payPeriod}
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline">
						<FileText className="h-4 w-4 mr-2" />
						Preview PDF
					</Button>
					<Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || isNegative}>
						{saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
						Save Changes
					</Button>
				</div>
			</div>

			{payslip.hasErrors && payslip.errors && (
				<Card className="border-destructive bg-destructive/5">
					<CardContent className="py-4">
						<div className="flex items-center gap-2 text-destructive">
							<AlertCircle className="h-5 w-5" />
							<span className="font-medium">Errors:</span>
						</div>
						<ul className="mt-2 ml-7 list-disc text-sm text-destructive">
							{payslip.errors.map((error, i) => (
								<li key={`error-${i}`}>{error}</li>
							))}
						</ul>
					</CardContent>
				</Card>
			)}

			{isNegative && (
				<Card className="border-destructive bg-destructive/5">
					<CardContent className="py-4 flex items-center gap-3">
						<AlertCircle className="h-5 w-5 text-destructive" />
						<span className="text-destructive font-medium">
							Net pay cannot be negative. Adjust earnings or deductions.
						</span>
					</CardContent>
				</Card>
			)}

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Plus className="h-5 w-5 text-green-600" />
								Earnings
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{earnings.map((earning) => (
								<div key={earning.id} className="flex items-start gap-4 p-4 border rounded-lg">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<p className="font-medium">{earning.name}</p>
											<Badge variant="outline">{earning.code}</Badge>
											{earning.isRequired && <Badge variant="secondary">Required</Badge>}
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="text-sm text-muted-foreground">Amount</label>
												<Input
													type="number"
													value={earning.amount}
													onChange={(e) => updateEarning(earning.id, "amount", Number(e.target.value))}
													disabled={earning.isRequired && earning.code === "BASIC"}
												/>
											</div>
											{earning.hours !== undefined && (
												<div>
													<label className="text-sm text-muted-foreground">Hours</label>
													<Input
														type="number"
														value={earning.hours}
														onChange={(e) => updateEarning(earning.id, "hours", Number(e.target.value))}
													/>
												</div>
											)}
										</div>
										<div className="mt-2">
											<Textarea
												placeholder="Note (optional)"
												className="h-16"
												value={earning.note || ""}
												onChange={(e) => updateEarning(earning.id, "note", e.target.value)}
											/>
										</div>
									</div>
									<div className="text-right min-w-24">
										<p className="text-lg font-bold text-green-600">{formatCurrency(earning.amount)}</p>
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Minus className="h-5 w-5 text-red-600" />
								Deductions
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{deductions.map((deduction) => (
								<div key={deduction.id} className={`flex items-start gap-4 p-4 border rounded-lg ${deduction.isSkipped ? "opacity-50" : ""}`}>
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<p className="font-medium">{deduction.name}</p>
											<Badge variant="outline">{deduction.code}</Badge>
											{deduction.isRequired && <Badge variant="secondary">Required</Badge>}
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="text-sm text-muted-foreground">Amount</label>
												<Input
													type="number"
													value={deduction.amount}
													onChange={(e) => updateDeduction(deduction.id, "amount", Number(e.target.value))}
													disabled={deduction.isRequired || deduction.isSkipped}
												/>
											</div>
											{!deduction.isRequired && (
												<div className="flex items-center gap-2 pt-6">
													<Switch
														checked={deduction.isSkipped}
														onCheckedChange={(checked) => updateDeduction(deduction.id, "isSkipped", checked)}
													/>
													<span className="text-sm text-muted-foreground">Skip this period</span>
												</div>
											)}
										</div>
										<div className="mt-2">
											<Textarea
												placeholder="Note (optional)"
												className="h-16"
												value={deduction.note || ""}
												onChange={(e) => updateDeduction(deduction.id, "note", e.target.value)}
											/>
										</div>
									</div>
									<div className="text-right min-w-24">
										<p className={`text-lg font-bold ${deduction.isSkipped ? "line-through text-muted-foreground" : "text-red-600"}`}>
											-{formatCurrency(deduction.amount)}
										</p>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card className="sticky top-6">
						<CardHeader>
							<CardTitle>Pay Summary</CardTitle>
							<CardDescription>{payslip.payPeriod}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Gross Pay</span>
									<span className="font-mono font-medium">{formatCurrency(grossPay)}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Total Deductions</span>
									<span className="font-mono font-medium text-red-600">-{formatCurrency(totalDeductions)}</span>
								</div>
								<div className="border-t pt-2">
									<div className="flex justify-between text-lg">
										<span className="font-bold">Net Pay</span>
										<span className={`font-mono font-bold ${isNegative ? "text-destructive" : "text-primary"}`}>
											{formatCurrency(netPay)}
										</span>
									</div>
								</div>
							</div>

							<div className="border-t pt-4">
								<h4 className="font-medium mb-2">Year-to-Date</h4>
								<div className="space-y-1 text-sm">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Gross</span>
										<span className="font-mono">{formatCurrency(payslip.ytdGross)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Tax</span>
										<span className="font-mono">{formatCurrency(payslip.ytdTax)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Net</span>
										<span className="font-mono">{formatCurrency(payslip.ytdNet)}</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

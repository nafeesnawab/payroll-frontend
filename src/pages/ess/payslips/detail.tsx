import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Building2, Download, FileText, Printer } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import type { ESSPayslipDetail } from "@/types/ess";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Separator } from "@/ui/separator";
import { Skeleton } from "@/ui/skeleton";

export default function ESSPayslipDetailPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const { data: payslip, isLoading } = useQuery({
		queryKey: ["ess-payslip", id],
		queryFn: async () => {
			const response = await axios.get(`/api/ess/payslips/${id}`);
			return response.data.data as ESSPayslipDetail;
		},
		enabled: !!id,
	});

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-ZA", {
			style: "currency",
			currency: "ZAR",
		}).format(amount);
	};

	const handleDownload = () => {
		window.open(`/api/ess/payslips/${id}/download`, "_blank");
	};

	const handlePrint = () => {
		window.print();
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-[600px]" />
			</div>
		);
	}

	if (!payslip) {
		return (
			<div className="text-center py-12">
				<FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
				<h3 className="text-lg font-medium">Payslip Not Found</h3>
				<p className="text-muted-foreground mb-4">The requested payslip could not be found.</p>
				<Button variant="outline" onClick={() => navigate("/ess/payslips")}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Payslips
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => navigate("/ess/payslips")}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold flex items-center gap-2">
							<FileText className="h-6 w-6" />
							Payslip Details
						</h1>
						<p className="text-muted-foreground">{payslip.payPeriod}</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" onClick={handlePrint}>
						<Printer className="h-4 w-4 mr-2" />
						Print
					</Button>
					<Button onClick={handleDownload}>
						<Download className="h-4 w-4 mr-2" />
						Download PDF
					</Button>
				</div>
			</div>

			<Card className="print:shadow-none print:border-0">
				<CardContent className="p-6">
					{/* Header */}
					<div className="flex justify-between items-start mb-6">
						<div>
							<h2 className="text-xl font-bold flex items-center gap-2">
								<Building2 className="h-5 w-5" />
								{payslip.employerName}
							</h2>
							<p className="text-sm text-muted-foreground whitespace-pre-line">{payslip.employerAddress}</p>
						</div>
						<div className="text-right">
							<p className="text-lg font-semibold">PAYSLIP</p>
							<p className="text-sm text-muted-foreground">Pay Date: {payslip.payDate}</p>
							<p className="text-sm text-muted-foreground">Period: {payslip.payPeriod}</p>
						</div>
					</div>

					<Separator className="my-4" />

					{/* Employee Details */}
					<div className="grid grid-cols-2 gap-4 mb-6">
						<div>
							<p className="text-sm text-muted-foreground">Employee Name</p>
							<p className="font-medium">{payslip.employeeName}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Employee Number</p>
							<p className="font-medium">{payslip.employeeNumber}</p>
						</div>
					</div>

					<Separator className="my-4" />

					{/* Earnings & Deductions */}
					<div className="grid md:grid-cols-2 gap-6">
						{/* Earnings */}
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base">Earnings</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{payslip.earnings.map((earning) => (
										<div key={earning.name} className="flex justify-between text-sm">
											<span>{earning.name}</span>
											<span className="font-medium">{formatCurrency(earning.amount)}</span>
										</div>
									))}
									<Separator className="my-2" />
									<div className="flex justify-between font-semibold">
										<span>Gross Pay</span>
										<span>{formatCurrency(payslip.grossPay)}</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Deductions */}
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base">Deductions</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{payslip.deductions.map((deduction) => (
										<div key={deduction.name} className="flex justify-between text-sm">
											<span>{deduction.name}</span>
											<span className="font-medium text-destructive">-{formatCurrency(deduction.amount)}</span>
										</div>
									))}
									<Separator className="my-2" />
									<div className="flex justify-between font-semibold">
										<span>Total Deductions</span>
										<span className="text-destructive">-{formatCurrency(payslip.totalDeductions)}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Net Pay */}
					<Card className="mt-6 bg-primary/5 border-primary/20">
						<CardContent className="p-4">
							<div className="flex justify-between items-center">
								<span className="text-lg font-semibold">Net Pay</span>
								<span className="text-2xl font-bold text-primary">{formatCurrency(payslip.netPay)}</span>
							</div>
						</CardContent>
					</Card>

					{/* Bank Details */}
					<div className="mt-6 grid grid-cols-2 gap-4 text-sm">
						<div>
							<p className="text-muted-foreground">Bank</p>
							<p className="font-medium">{payslip.bankName}</p>
						</div>
						<div>
							<p className="text-muted-foreground">Account Number</p>
							<p className="font-medium">{payslip.accountNumber}</p>
						</div>
					</div>

					{/* Notes */}
					{payslip.notes && (
						<div className="mt-6 p-4 bg-muted rounded-lg">
							<p className="text-sm text-muted-foreground">Notes</p>
							<p className="text-sm">{payslip.notes}</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

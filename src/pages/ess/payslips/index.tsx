import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Download, Eye, FileText } from "lucide-react";
import { useNavigate } from "react-router";
import type { ESSPayslip } from "@/types/ess";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export default function ESSPayslipsPage() {
	const navigate = useNavigate();

	const { data: payslips, isLoading } = useQuery({
		queryKey: ["ess-payslips"],
		queryFn: async () => {
			const response = await axios.get("/api/ess/payslips");
			return response.data.data as ESSPayslip[];
		},
	});

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-ZA", {
			style: "currency",
			currency: "ZAR",
		}).format(amount);
	};

	const handleDownload = (payslipId: string) => {
		window.open(`/api/ess/payslips/${payslipId}/download`, "_blank");
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-96" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<FileText className="h-6 w-6" />
					My Payslips
				</h1>
				<p className="text-muted-foreground">View and download your payslips</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Payslip History</CardTitle>
					<CardDescription>All your finalized payslips</CardDescription>
				</CardHeader>
				<CardContent>
					{payslips && payslips.length > 0 ? (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Pay Period</TableHead>
										<TableHead>Pay Date</TableHead>
										<TableHead className="text-right">Gross Pay</TableHead>
										<TableHead className="text-right">Net Pay</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{payslips.map((payslip) => (
										<TableRow key={payslip.id}>
											<TableCell className="font-medium">{payslip.payPeriod}</TableCell>
											<TableCell>{payslip.payDate}</TableCell>
											<TableCell className="text-right">{formatCurrency(payslip.grossPay)}</TableCell>
											<TableCell className="text-right font-medium">{formatCurrency(payslip.netPay)}</TableCell>
											<TableCell>
												<Badge variant="default">Finalized</Badge>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-2">
													<Button
														variant="ghost"
														size="icon"
														onClick={() => navigate(`/ess/payslips/${payslip.id}`)}
														title="View Payslip"
													>
														<Eye className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleDownload(payslip.id)}
														title="Download PDF"
													>
														<Download className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : (
						<div className="text-center py-12">
							<FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
							<h3 className="text-lg font-medium">No Payslips Available</h3>
							<p className="text-muted-foreground">Your payslips will appear here once they are finalized.</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

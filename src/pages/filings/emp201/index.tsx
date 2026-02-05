import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import type { EMP201 } from "@/types/filing";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Download, Eye, FileText } from "lucide-react";
import { useNavigate } from "react-router";

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

export default function EMP201ListPage() {
	const navigate = useNavigate();

	const { data: emp201List, isLoading } = useQuery({
		queryKey: ["emp201-list"],
		queryFn: async () => {
			const response = await axios.get("/api/filings/emp201");
			return response.data.data as EMP201[];
		},
	});

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => navigate("/filings")}>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<FileText className="h-6 w-6" />
						EMP201 Monthly Declarations
					</h1>
					<p className="text-muted-foreground">PAYE, UIF, and SDL monthly submissions to SARS</p>
				</div>
			</div>

			<Card>
				<CardContent className="pt-6">
					{isLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Period</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">PAYE</TableHead>
									<TableHead className="text-right">UIF</TableHead>
									<TableHead className="text-right">SDL</TableHead>
									<TableHead className="text-right">Employees</TableHead>
									<TableHead>Submitted</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{emp201List?.map((emp) => {
									const status = statusConfig[emp.status];
									return (
										<TableRow key={emp.id}>
											<TableCell className="font-medium">{emp.period}</TableCell>
											<TableCell>
												<Badge variant={status.variant}>{status.label}</Badge>
											</TableCell>
											<TableCell className="text-right font-mono">{formatCurrency(emp.totalPaye)}</TableCell>
											<TableCell className="text-right font-mono">{formatCurrency(emp.totalUif)}</TableCell>
											<TableCell className="text-right font-mono">{formatCurrency(emp.totalSdl)}</TableCell>
											<TableCell className="text-right">{emp.totalEmployees}</TableCell>
											<TableCell>
												{emp.submissionDate ? (
													<div>
														<p className="text-sm">{new Date(emp.submissionDate).toLocaleDateString()}</p>
														<p className="text-xs text-muted-foreground">{emp.submittedBy}</p>
													</div>
												) : (
													<span className="text-muted-foreground">—</span>
												)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button size="sm" variant="ghost" onClick={() => navigate(`/filings/emp201/${emp.id}`)}>
														<Eye className="h-4 w-4" />
													</Button>
													{(emp.status === "submitted" || emp.status === "accepted") && (
														<Button size="sm" variant="ghost">
															<Download className="h-4 w-4" />
														</Button>
													)}
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

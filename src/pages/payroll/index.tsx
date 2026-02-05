import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Calculator, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import type { PayrunListItem } from "@/types/payroll";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
	draft: { label: "Draft", variant: "secondary" },
	calculating: { label: "Calculating", variant: "outline" },
	ready: { label: "Ready", variant: "default" },
	finalized: { label: "Finalized", variant: "outline" },
};

const formatCurrency = (amount: number) =>
	new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(amount);

export default function PayrollPage() {
	const navigate = useNavigate();
	const [statusFilter, setStatusFilter] = useState("all");

	const { data: payruns, isLoading } = useQuery({
		queryKey: ["payruns", { status: statusFilter }],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (statusFilter !== "all") params.set("status", statusFilter);
			const response = await axios.get(`/api/payruns?${params.toString()}`);
			return response.data.data as PayrunListItem[];
		},
	});

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Calculator className="h-6 w-6" />
						Payroll
					</h1>
					<p className="text-muted-foreground">Manage pay runs and process payroll</p>
				</div>
				<Button onClick={() => navigate("/payroll/new")}>
					<Plus className="h-4 w-4 mr-2" />
					New Payrun
				</Button>
			</div>

			<Card>
				<CardContent className="pt-6">
					<div className="flex gap-4 mb-6">
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="draft">Draft</SelectItem>
								<SelectItem value="calculating">Calculating</SelectItem>
								<SelectItem value="ready">Ready</SelectItem>
								<SelectItem value="finalized">Finalized</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{isLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-12 w-full" />
							))}
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Pay Period</TableHead>
									<TableHead>Frequency</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Employees</TableHead>
									<TableHead className="text-right">Total Gross</TableHead>
									<TableHead className="text-right">Total Net</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{payruns?.map((payrun) => {
									const status = statusConfig[payrun.status];
									return (
										<TableRow
											key={payrun.id}
											className="cursor-pointer hover:bg-muted/50"
											onClick={() => navigate(`/payroll/${payrun.id}`)}
										>
											<TableCell className="font-medium">{payrun.payPeriod}</TableCell>
											<TableCell>{payrun.payFrequencyName}</TableCell>
											<TableCell>
												<Badge variant={status.variant}>{status.label}</Badge>
											</TableCell>
											<TableCell className="text-right">{payrun.employeeCount}</TableCell>
											<TableCell className="text-right font-mono">{formatCurrency(payrun.totalGross)}</TableCell>
											<TableCell className="text-right font-mono font-medium">
												{formatCurrency(payrun.totalNet)}
											</TableCell>
										</TableRow>
									);
								})}
								{payruns?.length === 0 && (
									<TableRow>
										<TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
											No payruns found
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

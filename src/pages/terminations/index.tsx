import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import type { Termination } from "@/types/termination";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Eye, Plus, UserMinus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

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

export default function TerminationsListPage() {
	const navigate = useNavigate();
	const [statusFilter, setStatusFilter] = useState("all");

	const { data: terminations, isLoading } = useQuery({
		queryKey: ["terminations", { status: statusFilter }],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (statusFilter !== "all") params.set("status", statusFilter);
			const response = await axios.get(`/api/terminations?${params.toString()}`);
			return response.data.data as Termination[];
		},
	});

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<UserMinus className="h-6 w-6" />
						Terminations
					</h1>
					<p className="text-muted-foreground">Manage employee offboarding</p>
				</div>
				<Button onClick={() => navigate("/terminations/new")}>
					<Plus className="h-4 w-4 mr-2" />
					Start Termination
				</Button>
			</div>

			<Card>
				<CardContent className="pt-6">
					<div className="flex gap-4 mb-6">
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-48">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="draft">Draft</SelectItem>
								<SelectItem value="pending_payroll">Pending Payroll</SelectItem>
								<SelectItem value="completed">Completed</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{isLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Employee</TableHead>
									<TableHead>Termination Date</TableHead>
									<TableHead>Reason</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Final Pay Period</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{terminations?.map((term) => {
									const status = statusConfig[term.status];
									return (
										<TableRow key={term.id}>
											<TableCell>
												<div>
													<p className="font-medium">{term.employeeName}</p>
													<p className="text-sm text-muted-foreground">{term.employeeNumber}</p>
												</div>
											</TableCell>
											<TableCell>{term.terminationDate}</TableCell>
											<TableCell>{reasonLabels[term.reason]}</TableCell>
											<TableCell>
												<Badge variant={status.variant}>{status.label}</Badge>
											</TableCell>
											<TableCell>{term.finalPayPeriod}</TableCell>
											<TableCell className="text-right">
												<Button size="sm" variant="ghost" onClick={() => navigate(`/terminations/${term.id}`)}>
													<Eye className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									);
								})}
								{terminations?.length === 0 && (
									<TableRow>
										<TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
											No terminations found
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

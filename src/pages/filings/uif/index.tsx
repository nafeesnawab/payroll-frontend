import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import type { UIFDeclaration } from "@/types/filing";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Download, Eye, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
	draft: { label: "Draft", variant: "secondary" },
	ready: { label: "Ready", variant: "outline" },
	submitted: { label: "Submitted", variant: "default" },
	accepted: { label: "Accepted", variant: "default" },
	rejected: { label: "Rejected", variant: "destructive" },
};

const typeConfig: Record<string, { label: string; color: string }> = {
	start: { label: "Start", color: "text-green-600" },
	update: { label: "Update", color: "text-blue-600" },
	termination: { label: "Termination", color: "text-red-600" },
};

export default function UIFDeclarationsPage() {
	const navigate = useNavigate();
	const [statusFilter, setStatusFilter] = useState("all");
	const [typeFilter, setTypeFilter] = useState("all");

	const { data: declarations, isLoading } = useQuery({
		queryKey: ["uif-declarations", { status: statusFilter, type: typeFilter }],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (statusFilter !== "all") params.set("status", statusFilter);
			if (typeFilter !== "all") params.set("type", typeFilter);
			const response = await axios.get(`/api/filings/uif?${params.toString()}`);
			return response.data.data as UIFDeclaration[];
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
						<Users className="h-6 w-6" />
						UIF Declarations
					</h1>
					<p className="text-muted-foreground">UI-19 / UI-2.7 employee declarations</p>
				</div>
			</div>

			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-wrap gap-4 mb-6">
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="draft">Draft</SelectItem>
								<SelectItem value="ready">Ready</SelectItem>
								<SelectItem value="submitted">Submitted</SelectItem>
								<SelectItem value="accepted">Accepted</SelectItem>
								<SelectItem value="rejected">Rejected</SelectItem>
							</SelectContent>
						</Select>
						<Select value={typeFilter} onValueChange={setTypeFilter}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								<SelectItem value="start">Start (UI-19)</SelectItem>
								<SelectItem value="update">Update</SelectItem>
								<SelectItem value="termination">Termination (UI-2.7)</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{isLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-16 w-full" />
							))}
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Employee</TableHead>
									<TableHead>ID Number</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Effective Date</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Last Updated</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{declarations?.map((dec) => {
									const status = statusConfig[dec.status];
									const type = typeConfig[dec.declarationType];
									return (
										<TableRow key={dec.id}>
											<TableCell>
												<div>
													<p className="font-medium">{dec.employeeName}</p>
													<p className="text-sm text-muted-foreground">{dec.employeeNumber}</p>
												</div>
											</TableCell>
											<TableCell className="font-mono">{dec.idNumber}</TableCell>
											<TableCell>
												<span className={type.color}>{type.label}</span>
											</TableCell>
											<TableCell>{dec.effectiveDate}</TableCell>
											<TableCell>
												<Badge variant={status.variant}>{status.label}</Badge>
											</TableCell>
											<TableCell>{new Date(dec.lastUpdated).toLocaleDateString()}</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button size="sm" variant="ghost">
														<Eye className="h-4 w-4" />
													</Button>
													<Button size="sm" variant="ghost">
														<Download className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									);
								})}
								{declarations?.length === 0 && (
									<TableRow>
										<TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
											No declarations found
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

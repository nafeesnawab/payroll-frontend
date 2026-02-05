import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Download, FileText, Filter } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

interface Report {
	id: string;
	name: string;
	category: string;
	description: string;
	lastGenerated?: string;
	format: string;
}

const REPORT_CATEGORIES = [
	{ value: "payroll", label: "Payroll Reports" },
	{ value: "statutory", label: "Statutory Reports" },
	{ value: "employee", label: "Employee Reports" },
	{ value: "leave", label: "Leave Reports" },
	{ value: "financial", label: "Financial Reports" },
];

export default function ReportsPage() {
	const [categoryFilter, setCategoryFilter] = useState("");

	const { data: reports, isLoading } = useQuery({
		queryKey: ["reports", categoryFilter],
		queryFn: async () => {
			const response = await axios.get(`/api/reports?category=${categoryFilter}`);
			return response.data.data as Report[];
		},
	});

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-96" />
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<FileText className="h-6 w-6" />
						Reports
					</h1>
					<p className="text-muted-foreground">Generate and download payroll and compliance reports</p>
				</div>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<Filter className="h-4 w-4 text-muted-foreground" />
						<Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v === "all" ? "" : v)}>
							<SelectTrigger className="w-48">
								<SelectValue placeholder="All Categories" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								{REPORT_CATEGORIES.map((cat) => (
									<SelectItem key={cat.value} value={cat.value}>
										{cat.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Reports List */}
			<Card>
				<CardHeader>
					<CardTitle>Available Reports</CardTitle>
					<CardDescription>Select a report to generate and download</CardDescription>
				</CardHeader>
				<CardContent>
					{reports && reports.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Report Name</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Format</TableHead>
									<TableHead>Last Generated</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{reports.map((report) => (
									<TableRow key={report.id}>
										<TableCell className="font-medium">{report.name}</TableCell>
										<TableCell>
											<Badge variant="outline">{report.category}</Badge>
										</TableCell>
										<TableCell className="text-muted-foreground max-w-xs truncate">{report.description}</TableCell>
										<TableCell className="uppercase text-xs">{report.format}</TableCell>
										<TableCell className="text-muted-foreground">
											{report.lastGenerated ? new Date(report.lastGenerated).toLocaleDateString() : "Never"}
										</TableCell>
										<TableCell className="text-right">
											<Button variant="outline" size="sm">
												<Download className="h-4 w-4 mr-2" />
												Generate
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-muted-foreground text-center py-8">No reports available</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

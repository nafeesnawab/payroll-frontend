import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Database, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";
import type { DataOverview, ImportJob, ExportJob } from "@/types/data-operations";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export default function DataDashboardPage() {
	const navigate = useNavigate();

	const { data: overview, isLoading: loadingOverview } = useQuery({
		queryKey: ["data-overview"],
		queryFn: async () => {
			const response = await axios.get("/api/data/overview");
			return response.data.data as DataOverview;
		},
	});

	const { data: recentImports } = useQuery({
		queryKey: ["recent-imports"],
		queryFn: async () => {
			const response = await axios.get("/api/data/imports?limit=5");
			return response.data.data as ImportJob[];
		},
	});

	const { data: recentExports } = useQuery({
		queryKey: ["recent-exports"],
		queryFn: async () => {
			const response = await axios.get("/api/data/exports/history?limit=5");
			return response.data.data as ExportJob[];
		},
	});

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "completed":
				return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
			case "processing":
				return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
			case "pending":
				return <Badge variant="secondary">Pending</Badge>;
			case "failed":
				return <Badge variant="destructive">Failed</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	if (loadingOverview) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<div className="grid gap-4 md:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-32" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Database className="h-6 w-6" />
						Data Operations
					</h1>
					<p className="text-muted-foreground">Import, export, and migrate payroll data</p>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/data/imports")}>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<ArrowUpFromLine className="h-4 w-4" />
							Recent Imports
						</CardDescription>
						<CardTitle className="text-3xl">{overview?.recentImports ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">in the last 30 days</p>
					</CardContent>
				</Card>

				<Card
					className="cursor-pointer hover:shadow-md transition-shadow"
					onClick={() => navigate("/data/exports/history")}
				>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<ArrowDownToLine className="h-4 w-4" />
							Recent Exports
						</CardDescription>
						<CardTitle className="text-3xl">{overview?.recentExports ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">in the last 30 days</p>
					</CardContent>
				</Card>

				<Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/data/migration")}>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<RefreshCw className="h-4 w-4" />
							Migration Status
						</CardDescription>
						<CardTitle className="text-lg capitalize">
							{overview?.migrationStatus?.replace("_", " ") ?? "Idle"}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">data migration tools</p>
					</CardContent>
				</Card>

				<Card className={overview?.failedJobs ? "border-destructive" : ""}>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<AlertTriangle className="h-4 w-4 text-destructive" />
							Failed Jobs
						</CardDescription>
						<CardTitle className="text-3xl text-destructive">{overview?.failedJobs ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">require attention</p>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<div className="grid gap-4 md:grid-cols-3">
				<Button variant="outline" className="h-auto py-4 justify-start" onClick={() => navigate("/data/imports")}>
					<ArrowUpFromLine className="h-5 w-5 mr-3" />
					<div className="text-left">
						<p className="font-medium">Import Data</p>
						<p className="text-xs text-muted-foreground">Upload employees, balances, inputs</p>
					</div>
				</Button>
				<Button variant="outline" className="h-auto py-4 justify-start" onClick={() => navigate("/data/exports")}>
					<ArrowDownToLine className="h-5 w-5 mr-3" />
					<div className="text-left">
						<p className="font-medium">Export Data</p>
						<p className="text-xs text-muted-foreground">Download reports and backups</p>
					</div>
				</Button>
				<Button variant="outline" className="h-auto py-4 justify-start" onClick={() => navigate("/data/migration")}>
					<RefreshCw className="h-5 w-5 mr-3" />
					<div className="text-left">
						<p className="font-medium">Migration Tools</p>
						<p className="text-xs text-muted-foreground">Migrate from other systems</p>
					</div>
				</Button>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Recent Imports */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Recent Imports</CardTitle>
						<CardDescription>Last 5 import jobs</CardDescription>
					</CardHeader>
					<CardContent>
						{recentImports && recentImports.length > 0 ? (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Type</TableHead>
										<TableHead>Rows</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{recentImports.map((job) => (
										<TableRow key={job.id}>
											<TableCell className="font-medium">{job.typeLabel}</TableCell>
											<TableCell>{job.totalRows}</TableCell>
											<TableCell>{getStatusBadge(job.status)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<p className="text-muted-foreground text-center py-4">No recent imports</p>
						)}
					</CardContent>
				</Card>

				{/* Recent Exports */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Recent Exports</CardTitle>
						<CardDescription>Last 5 export jobs</CardDescription>
					</CardHeader>
					<CardContent>
						{recentExports && recentExports.length > 0 ? (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Type</TableHead>
										<TableHead>Format</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{recentExports.map((job) => (
										<TableRow key={job.id}>
											<TableCell className="font-medium">{job.typeLabel}</TableCell>
											<TableCell className="uppercase">{job.format}</TableCell>
											<TableCell>{getStatusBadge(job.status)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<p className="text-muted-foreground text-center py-4">No recent exports</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

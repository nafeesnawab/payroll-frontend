import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, Download, Search, Shield } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { AuditLog, AuditLogFilters, ModuleName } from "@/types/access";
import { MODULE_LABELS } from "@/types/access";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export default function AuditLogsPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [filters, setFilters] = useState<AuditLogFilters>({
		startDate: "",
		endDate: "",
		module: undefined,
		isHighRisk: searchParams.get("highRisk") === "true" || undefined,
	});
	const [searchTerm, setSearchTerm] = useState("");

	const { data: logs, isLoading } = useQuery({
		queryKey: ["audit-logs", filters],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (filters.startDate) params.append("startDate", filters.startDate);
			if (filters.endDate) params.append("endDate", filters.endDate);
			if (filters.module) params.append("module", filters.module);
			if (filters.isHighRisk) params.append("isHighRisk", "true");
			const response = await axios.get(`/api/audit-logs?${params.toString()}`);
			return response.data.data as AuditLog[];
		},
	});

	const filteredLogs = logs?.filter((log) => {
		if (!searchTerm) return true;
		const search = searchTerm.toLowerCase();
		return (
			log.userName.toLowerCase().includes(search) ||
			log.actionLabel.toLowerCase().includes(search) ||
			log.entityName?.toLowerCase().includes(search)
		);
	});

	const handleExport = () => {
		const csv = [
			["Timestamp", "User", "Action", "Module", "Entity", "IP Address", "High Risk"].join(","),
			...(filteredLogs || []).map((log) =>
				[
					log.timestamp,
					log.userName,
					log.actionLabel,
					MODULE_LABELS[log.module],
					log.entityName || "",
					log.ipAddress,
					log.isHighRisk ? "Yes" : "No",
				].join(","),
			),
		].join("\n");

		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
		a.click();
	};

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
						<Shield className="h-6 w-6" />
						Audit Logs
					</h1>
					<p className="text-muted-foreground">Track all sensitive actions in the system</p>
				</div>
				<Button variant="outline" onClick={handleExport}>
					<Download className="h-4 w-4 mr-2" />
					Export CSV
				</Button>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-wrap gap-4 items-end">
						<div className="flex-1 min-w-[200px]">
							<Label className="sr-only">Search</Label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search by user, action, or entity..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-9"
								/>
							</div>
						</div>

						<div className="w-40">
							<Label className="text-xs text-muted-foreground">Module</Label>
							<Select
								value={filters.module || "all"}
								onValueChange={(value) =>
									setFilters({ ...filters, module: value === "all" ? undefined : (value as ModuleName) })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="All modules" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Modules</SelectItem>
									{Object.entries(MODULE_LABELS).map(([key, label]) => (
										<SelectItem key={key} value={key}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="w-36">
							<Label className="text-xs text-muted-foreground">From</Label>
							<Input
								type="date"
								value={filters.startDate || ""}
								onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
							/>
						</div>

						<div className="w-36">
							<Label className="text-xs text-muted-foreground">To</Label>
							<Input
								type="date"
								value={filters.endDate || ""}
								onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
							/>
						</div>

						<Button
							variant={filters.isHighRisk ? "destructive" : "outline"}
							onClick={() => setFilters({ ...filters, isHighRisk: !filters.isHighRisk })}
						>
							<AlertTriangle className="h-4 w-4 mr-2" />
							High Risk Only
						</Button>

						<Button
							variant="ghost"
							onClick={() => {
								setFilters({ startDate: "", endDate: "", module: undefined, isHighRisk: undefined });
								setSearchTerm("");
							}}
						>
							Clear Filters
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Logs Table */}
			<Card>
				<CardHeader>
					<CardTitle>Activity Log</CardTitle>
					<CardDescription>{filteredLogs?.length || 0} records found</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Timestamp</TableHead>
									<TableHead>User</TableHead>
									<TableHead>Action</TableHead>
									<TableHead>Module</TableHead>
									<TableHead>Entity</TableHead>
									<TableHead>IP Address</TableHead>
									<TableHead className="text-right">Details</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredLogs?.map((log) => (
									<TableRow key={log.id} className={log.isHighRisk ? "bg-destructive/5" : ""}>
										<TableCell className="whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</TableCell>
										<TableCell>
											<div>
												<p className="font-medium">{log.userName}</p>
												<p className="text-xs text-muted-foreground">{log.userEmail}</p>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												{log.isHighRisk && <AlertTriangle className="h-4 w-4 text-destructive" />}
												<span>{log.actionLabel}</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="outline">{MODULE_LABELS[log.module]}</Badge>
										</TableCell>
										<TableCell className="text-muted-foreground">{log.entityName || "-"}</TableCell>
										<TableCell className="text-muted-foreground font-mono text-xs">{log.ipAddress}</TableCell>
										<TableCell className="text-right">
											<Button variant="ghost" size="sm" onClick={() => navigate(`/audit-logs/${log.id}`)}>
												View
											</Button>
										</TableCell>
									</TableRow>
								))}
								{(!filteredLogs || filteredLogs.length === 0) && (
									<TableRow>
										<TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
											No audit logs found
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

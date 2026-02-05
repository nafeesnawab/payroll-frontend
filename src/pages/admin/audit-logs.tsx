import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Download, FileText, Filter, Search } from "lucide-react";
import { useState } from "react";
import type { AdminAuditLog } from "@/types/admin";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

const AUDIT_CATEGORIES = [
	{ value: "login", label: "Logins" },
	{ value: "settings", label: "Settings Changes" },
	{ value: "impersonation", label: "Impersonation" },
	{ value: "suspension", label: "Suspensions" },
	{ value: "feature_toggle", label: "Feature Toggles" },
	{ value: "billing", label: "Billing Changes" },
];

export default function AdminAuditLogsPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");

	const { data: logs, isLoading } = useQuery({
		queryKey: ["admin-audit-logs", categoryFilter, searchTerm],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (categoryFilter) params.append("category", categoryFilter);
			if (searchTerm) params.append("search", searchTerm);
			const response = await axios.get(`/api/admin/audit-logs?${params.toString()}`);
			return response.data.data as AdminAuditLog[];
		},
	});

	const getCategoryBadge = (category: string) => {
		switch (category) {
			case "login":
				return <Badge variant="outline">Login</Badge>;
			case "settings":
				return <Badge className="bg-blue-100 text-blue-800">Settings</Badge>;
			case "impersonation":
				return <Badge className="bg-purple-100 text-purple-800">Impersonation</Badge>;
			case "suspension":
				return <Badge variant="destructive">Suspension</Badge>;
			case "feature_toggle":
				return <Badge className="bg-amber-100 text-amber-800">Feature</Badge>;
			case "billing":
				return <Badge className="bg-green-100 text-green-800">Billing</Badge>;
			default:
				return <Badge variant="outline">{category}</Badge>;
		}
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
						<FileText className="h-6 w-6" />
						Admin Audit Logs
					</h1>
					<p className="text-muted-foreground">
						Track all sensitive platform actions
					</p>
				</div>
				<Button variant="outline">
					<Download className="h-4 w-4 mr-2" />
					Export Logs
				</Button>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-wrap gap-4">
						<div className="flex-1 min-w-[200px]">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search by user or action..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-9"
								/>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4 text-muted-foreground" />
							<Select
								value={categoryFilter}
								onValueChange={(v) => setCategoryFilter(v === "all" ? "" : v)}
							>
								<SelectTrigger className="w-48">
									<SelectValue placeholder="All Categories" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Categories</SelectItem>
									{AUDIT_CATEGORIES.map((cat) => (
										<SelectItem key={cat.value} value={cat.value}>
											{cat.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Logs Table */}
			<Card>
				<CardHeader>
					<CardTitle>Audit Trail</CardTitle>
					<CardDescription>
						{logs?.length || 0} events found
					</CardDescription>
				</CardHeader>
				<CardContent>
					{logs && logs.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Timestamp</TableHead>
									<TableHead>User</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Action</TableHead>
									<TableHead>Target</TableHead>
									<TableHead>IP Address</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{logs.map((log) => (
									<TableRow key={log.id}>
										<TableCell className="text-muted-foreground">
											{new Date(log.timestamp).toLocaleString()}
										</TableCell>
										<TableCell className="font-medium">{log.userName}</TableCell>
										<TableCell>{getCategoryBadge(log.category)}</TableCell>
										<TableCell>{log.action}</TableCell>
										<TableCell className="text-muted-foreground">
											{log.targetName || "-"}
										</TableCell>
										<TableCell className="text-muted-foreground font-mono text-xs">
											{log.ipAddress}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-muted-foreground text-center py-8">
							No audit logs found
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

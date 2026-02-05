import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, ArrowLeft, Clock, Download, Globe, Monitor, Shield, User } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import type { AuditLogDetail } from "@/types/access";
import { MODULE_LABELS } from "@/types/access";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Separator } from "@/ui/separator";
import { Skeleton } from "@/ui/skeleton";

export default function AuditLogDetailPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const { data: log, isLoading } = useQuery({
		queryKey: ["audit-log", id],
		queryFn: async () => {
			const response = await axios.get(`/api/audit-logs/${id}`);
			return response.data.data as AuditLogDetail;
		},
		enabled: !!id,
	});

	const handleExport = () => {
		if (!log) return;
		const data = JSON.stringify(log, null, 2);
		const blob = new Blob([data], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `audit-log-${log.id}.json`;
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

	if (!log) {
		return (
			<div className="p-6 text-center">
				<p className="text-muted-foreground">Audit log not found</p>
				<Button variant="outline" onClick={() => navigate("/audit-logs")} className="mt-4">
					Back to Audit Logs
				</Button>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => navigate("/audit-logs")}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold flex items-center gap-2">
							<Shield className="h-6 w-6" />
							Audit Log Detail
						</h1>
						<p className="text-muted-foreground">
							{new Date(log.timestamp).toLocaleString()}
						</p>
					</div>
					{log.isHighRisk && (
						<Badge variant="destructive" className="gap-1">
							<AlertTriangle className="h-3 w-3" />
							High Risk
						</Badge>
					)}
				</div>
				<Button variant="outline" onClick={handleExport}>
					<Download className="h-4 w-4 mr-2" />
					Export JSON
				</Button>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Action Details */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Action Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<p className="text-sm text-muted-foreground">Action</p>
							<p className="font-medium text-lg">{log.actionLabel}</p>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-muted-foreground">Module</p>
								<Badge variant="outline">{MODULE_LABELS[log.module]}</Badge>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Entity Type</p>
								<p className="font-medium">{log.entityType}</p>
							</div>
						</div>
						{log.entityName && (
							<div>
								<p className="text-sm text-muted-foreground">Entity</p>
								<p className="font-medium">{log.entityName}</p>
								{log.entityId && (
									<p className="text-xs text-muted-foreground">ID: {log.entityId}</p>
								)}
							</div>
						)}
						<Separator />
						<div>
							<p className="text-sm text-muted-foreground flex items-center gap-1">
								<Clock className="h-3 w-3" /> Timestamp
							</p>
							<p className="font-medium">{new Date(log.timestamp).toLocaleString()}</p>
						</div>
					</CardContent>
				</Card>

				{/* User & Session Info */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base flex items-center gap-2">
							<User className="h-4 w-4" />
							User Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<p className="text-sm text-muted-foreground">User</p>
							<p className="font-medium">{log.userName}</p>
							<p className="text-sm text-muted-foreground">{log.userEmail}</p>
						</div>
						<Separator />
						<div>
							<p className="text-sm text-muted-foreground flex items-center gap-1">
								<Globe className="h-3 w-3" /> IP Address
							</p>
							<p className="font-mono">{log.ipAddress}</p>
						</div>
						{log.userAgent && (
							<div>
								<p className="text-sm text-muted-foreground flex items-center gap-1">
									<Monitor className="h-3 w-3" /> Device
								</p>
								<p className="text-sm break-all">{log.userAgent}</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Before Data */}
				{log.beforeData && Object.keys(log.beforeData).length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Before</CardTitle>
							<CardDescription>Data state before the action</CardDescription>
						</CardHeader>
						<CardContent>
							<pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
								{JSON.stringify(log.beforeData, null, 2)}
							</pre>
						</CardContent>
					</Card>
				)}

				{/* After Data */}
				{log.afterData && Object.keys(log.afterData).length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-base">After</CardTitle>
							<CardDescription>Data state after the action</CardDescription>
						</CardHeader>
						<CardContent>
							<pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
								{JSON.stringify(log.afterData, null, 2)}
							</pre>
						</CardContent>
					</Card>
				)}

				{/* Metadata */}
				{log.metadata && Object.keys(log.metadata).length > 0 && (
					<Card className="md:col-span-2">
						<CardHeader>
							<CardTitle className="text-base">Additional Metadata</CardTitle>
						</CardHeader>
						<CardContent>
							<pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
								{JSON.stringify(log.metadata, null, 2)}
							</pre>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, Bell, CheckCircle, Mail, Settings, XCircle, Zap } from "lucide-react";
import { useNavigate } from "react-router";
import type { NotificationLog, NotificationOverview } from "@/types/notifications";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export default function NotificationsDashboardPage() {
	const navigate = useNavigate();

	const { data: overview, isLoading: loadingOverview } = useQuery({
		queryKey: ["notifications-overview"],
		queryFn: async () => {
			const response = await axios.get("/api/notifications/overview");
			return response.data.data as NotificationOverview;
		},
	});

	const { data: recentLogs, isLoading: loadingLogs } = useQuery({
		queryKey: ["notifications-recent"],
		queryFn: async () => {
			const response = await axios.get("/api/notifications/logs?limit=10");
			return response.data.data as NotificationLog[];
		},
	});

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "sent":
				return <Badge className="bg-green-100 text-green-800">Sent</Badge>;
			case "read":
				return <Badge className="bg-blue-100 text-blue-800">Read</Badge>;
			case "failed":
				return <Badge variant="destructive">Failed</Badge>;
			case "pending":
				return <Badge variant="secondary">Pending</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const getChannelIcon = (channel: string) => {
		switch (channel) {
			case "email":
				return <Mail className="h-4 w-4" />;
			case "in_app":
				return <Bell className="h-4 w-4" />;
			default:
				return <Bell className="h-4 w-4" />;
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
						<Bell className="h-6 w-6" />
						Notifications
					</h1>
					<p className="text-muted-foreground">Monitor notification activity and delivery status</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => navigate("/notifications/settings")}>
						<Settings className="h-4 w-4 mr-2" />
						Settings
					</Button>
					<Button onClick={() => navigate("/automation")}>
						<Zap className="h-4 w-4 mr-2" />
						Automation
					</Button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<CheckCircle className="h-4 w-4 text-green-600" />
							Sent This Period
						</CardDescription>
						<CardTitle className="text-3xl">{overview?.sentThisPeriod ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">notifications delivered</p>
					</CardContent>
				</Card>

				<Card
					className="cursor-pointer hover:shadow-md transition-shadow"
					onClick={() => navigate("/notifications/logs?status=failed")}
				>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<XCircle className="h-4 w-4 text-destructive" />
							Failed
						</CardDescription>
						<CardTitle className="text-3xl text-destructive">{overview?.failedCount ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">delivery failures</p>
					</CardContent>
				</Card>

				<Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/automation")}>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<Zap className="h-4 w-4 text-amber-600" />
							Active Automations
						</CardDescription>
						<CardTitle className="text-3xl">{overview?.activeAutomations ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">rules running</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<AlertTriangle className="h-4 w-4 text-amber-600" />
							Pending
						</CardDescription>
						<CardTitle className="text-3xl">{overview?.pendingCount ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">awaiting delivery</p>
					</CardContent>
				</Card>
			</div>

			{/* Quick Links */}
			<div className="grid gap-4 md:grid-cols-3">
				<Button
					variant="outline"
					className="h-auto py-4 justify-start"
					onClick={() => navigate("/notifications/settings")}
				>
					<Settings className="h-5 w-5 mr-3" />
					<div className="text-left">
						<p className="font-medium">Notification Settings</p>
						<p className="text-xs text-muted-foreground">Configure triggers and recipients</p>
					</div>
				</Button>
				<Button variant="outline" className="h-auto py-4 justify-start" onClick={() => navigate("/notifications/logs")}>
					<Bell className="h-5 w-5 mr-3" />
					<div className="text-left">
						<p className="font-medium">View All Logs</p>
						<p className="text-xs text-muted-foreground">Full notification history</p>
					</div>
				</Button>
				<Button
					variant="outline"
					className="h-auto py-4 justify-start"
					onClick={() => navigate("/notifications/preferences")}
				>
					<Mail className="h-5 w-5 mr-3" />
					<div className="text-left">
						<p className="font-medium">My Preferences</p>
						<p className="text-xs text-muted-foreground">Personal notification settings</p>
					</div>
				</Button>
			</div>

			{/* Recent Notifications */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Notifications</CardTitle>
					<CardDescription>Last 10 notifications sent</CardDescription>
				</CardHeader>
				<CardContent>
					{loadingLogs ? (
						<Skeleton className="h-48" />
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Type</TableHead>
									<TableHead>Recipient</TableHead>
									<TableHead>Channel</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Sent At</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{recentLogs?.map((log) => (
									<TableRow key={log.id} className={log.status === "failed" ? "bg-destructive/5" : ""}>
										<TableCell className="font-medium">{log.typeLabel}</TableCell>
										<TableCell>
											<div>
												<p>{log.recipientName}</p>
												<p className="text-xs text-muted-foreground">{log.recipientEmail}</p>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												{getChannelIcon(log.channel)}
												<span className="capitalize">{log.channel.replace("_", " ")}</span>
											</div>
										</TableCell>
										<TableCell>{getStatusBadge(log.status)}</TableCell>
										<TableCell className="text-muted-foreground">{new Date(log.sentAt).toLocaleString()}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

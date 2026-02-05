import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, Building2, DollarSign, Search, Settings, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router";
import type { PlatformOverview, RecentActivity } from "@/types/admin";
import { Alert, AlertDescription } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";

export default function PlatformAdminDashboardPage() {
	const navigate = useNavigate();

	const { data: overview, isLoading: loadingOverview } = useQuery({
		queryKey: ["admin-overview"],
		queryFn: async () => {
			const response = await axios.get("/api/admin/overview");
			return response.data.data as PlatformOverview;
		},
	});

	const { data: recentActivity } = useQuery({
		queryKey: ["admin-activity"],
		queryFn: async () => {
			const response = await axios.get("/api/admin/activity");
			return response.data.data as RecentActivity[];
		},
	});

	const getSeverityBadge = (severity: string) => {
		switch (severity) {
			case "error":
				return <Badge variant="destructive">Error</Badge>;
			case "warning":
				return <Badge className="bg-amber-100 text-amber-800">Warning</Badge>;
			default:
				return <Badge variant="secondary">Info</Badge>;
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
			{/* Admin Warning Banner */}
			<Alert variant="destructive" className="bg-red-50 border-red-200">
				<Shield className="h-4 w-4" />
				<AlertDescription className="text-red-800">
					<strong>Platform Admin Mode</strong> - You have elevated privileges. All actions are logged and audited.
				</AlertDescription>
			</Alert>

			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Shield className="h-6 w-6" />
						Platform Admin
					</h1>
					<p className="text-muted-foreground">
						System health and operational overview
					</p>
				</div>
				<div className="flex gap-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search company..."
							className="pl-9 w-64"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									navigate("/admin/companies");
								}
							}}
						/>
					</div>
					<Button variant="outline" onClick={() => navigate("/admin/settings")}>
						<Settings className="h-4 w-4 mr-2" />
						System Settings
					</Button>
				</div>
			</div>

			{/* System Metrics */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card
					className="cursor-pointer hover:shadow-md transition-shadow"
					onClick={() => navigate("/admin/companies")}
				>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<Building2 className="h-4 w-4" />
							Active Companies
						</CardDescription>
						<CardTitle className="text-3xl">{overview?.activeCompanies ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							+{overview?.newSignupsThisWeek ?? 0} this week
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							Active Employees
						</CardDescription>
						<CardTitle className="text-3xl">
							{overview?.activeEmployees?.toLocaleString() ?? 0}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">across all companies</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<DollarSign className="h-4 w-4" />
							Payrolls This Month
						</CardDescription>
						<CardTitle className="text-3xl">
							{overview?.payrollsProcessedThisMonth ?? 0}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">processed successfully</p>
					</CardContent>
				</Card>

				<Card className={overview?.errorRate && overview.errorRate > 1 ? "border-destructive" : ""}>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<AlertTriangle className="h-4 w-4 text-destructive" />
							Error Rate
						</CardDescription>
						<CardTitle className="text-3xl">
							{overview?.errorRate?.toFixed(2) ?? 0}%
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							{overview?.failedPayrollRuns ?? 0} failed runs
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<div className="grid gap-4 md:grid-cols-4">
				<Button
					variant="outline"
					className="h-auto py-4 justify-start"
					onClick={() => navigate("/admin/companies")}
				>
					<Building2 className="h-5 w-5 mr-3" />
					<div className="text-left">
						<p className="font-medium">Companies</p>
						<p className="text-xs text-muted-foreground">Search & manage</p>
					</div>
				</Button>
				<Button
					variant="outline"
					className="h-auto py-4 justify-start"
					onClick={() => navigate("/admin/users")}
				>
					<Users className="h-5 w-5 mr-3" />
					<div className="text-left">
						<p className="font-medium">Admin Users</p>
						<p className="text-xs text-muted-foreground">Platform access</p>
					</div>
				</Button>
				<Button
					variant="outline"
					className="h-auto py-4 justify-start"
					onClick={() => navigate("/admin/monitoring")}
				>
					<Settings className="h-5 w-5 mr-3" />
					<div className="text-left">
						<p className="font-medium">Monitoring</p>
						<p className="text-xs text-muted-foreground">Jobs & health</p>
					</div>
				</Button>
				<Button
					variant="outline"
					className="h-auto py-4 justify-start"
					onClick={() => navigate("/admin/features")}
				>
					<Shield className="h-5 w-5 mr-3" />
					<div className="text-left">
						<p className="font-medium">Feature Flags</p>
						<p className="text-xs text-muted-foreground">Rollout control</p>
					</div>
				</Button>
			</div>

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
					<CardDescription>System events and alerts</CardDescription>
				</CardHeader>
				<CardContent>
					{recentActivity && recentActivity.length > 0 ? (
						<div className="space-y-3">
							{recentActivity.map((activity) => (
								<div
									key={activity.id}
									className="flex items-center justify-between p-3 border rounded-lg"
								>
									<div className="flex items-center gap-3">
										{getSeverityBadge(activity.severity)}
										<div>
											<p className="font-medium">{activity.description}</p>
											{activity.companyName && (
												<p className="text-xs text-muted-foreground">
													{activity.companyName}
												</p>
											)}
										</div>
									</div>
									<p className="text-sm text-muted-foreground">
										{new Date(activity.timestamp).toLocaleString()}
									</p>
								</div>
							))}
						</div>
					) : (
						<p className="text-muted-foreground text-center py-8">No recent activity</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

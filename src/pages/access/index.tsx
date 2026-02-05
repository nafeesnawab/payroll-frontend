import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, Key, Shield, ShieldAlert, Users } from "lucide-react";
import { useNavigate } from "react-router";
import type { AccessOverview } from "@/types/access";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

export default function AccessOverviewPage() {
	const navigate = useNavigate();

	const { data: overview, isLoading } = useQuery({
		queryKey: ["access-overview"],
		queryFn: async () => {
			const response = await axios.get("/api/access/overview");
			return response.data.data as AccessOverview;
		},
	});

	if (isLoading) {
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
						<Shield className="h-6 w-6" />
						Access Control
					</h1>
					<p className="text-muted-foreground">Manage roles, permissions, and user access</p>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/access/users")}>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							Total Users
						</CardDescription>
						<CardTitle className="text-3xl">{overview?.totalUsers ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex gap-2 text-xs">
							<Badge variant="default">{overview?.activeUsers} active</Badge>
							<Badge variant="secondary">{overview?.invitedUsers} invited</Badge>
							{(overview?.suspendedUsers ?? 0) > 0 && (
								<Badge variant="destructive">{overview?.suspendedUsers} suspended</Badge>
							)}
						</div>
					</CardContent>
				</Card>

				<Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/access/roles")}>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<Key className="h-4 w-4" />
							Active Roles
						</CardDescription>
						<CardTitle className="text-3xl">{overview?.totalRoles ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">permission bundles defined</p>
					</CardContent>
				</Card>

				<Card
					className="cursor-pointer hover:shadow-md transition-shadow"
					onClick={() => navigate("/access/users?filter=admin")}
				>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<ShieldAlert className="h-4 w-4" />
							Admin Access
						</CardDescription>
						<CardTitle className="text-3xl text-amber-600">{overview?.usersWithAdminAccess ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">users with elevated privileges</p>
					</CardContent>
				</Card>

				<Card
					className="cursor-pointer hover:shadow-md transition-shadow"
					onClick={() => navigate("/audit-logs?highRisk=true")}
				>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<AlertTriangle className="h-4 w-4" />
							High-Risk Actions
						</CardDescription>
						<CardTitle className="text-3xl text-destructive">{overview?.recentHighRiskActions?.length ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">in the last 7 days</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>Common access management tasks</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Button variant="outline" className="w-full justify-start" onClick={() => navigate("/access/roles")}>
							<Key className="h-4 w-4 mr-2" />
							Manage Roles
						</Button>
						<Button variant="outline" className="w-full justify-start" onClick={() => navigate("/access/users")}>
							<Users className="h-4 w-4 mr-2" />
							Manage Users
						</Button>
						<Button variant="outline" className="w-full justify-start" onClick={() => navigate("/audit-logs")}>
							<Shield className="h-4 w-4 mr-2" />
							View Audit Logs
						</Button>
					</CardContent>
				</Card>

				{/* Recent High-Risk Actions */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-destructive" />
							Recent High-Risk Actions
						</CardTitle>
						<CardDescription>Actions requiring attention</CardDescription>
					</CardHeader>
					<CardContent>
						{overview?.recentHighRiskActions && overview.recentHighRiskActions.length > 0 ? (
							<div className="space-y-3">
								{overview.recentHighRiskActions.slice(0, 5).map((action) => (
									<button
										type="button"
										key={action.id}
										className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer text-left"
										onClick={() => navigate(`/audit-logs/${action.id}`)}
									>
										<div>
											<p className="font-medium text-sm">{action.action}</p>
											<p className="text-xs text-muted-foreground">by {action.user}</p>
										</div>
										<Badge variant="outline" className="text-xs">
											{new Date(action.timestamp).toLocaleDateString()}
										</Badge>
									</button>
								))}
							</div>
						) : (
							<p className="text-muted-foreground text-center py-8">No high-risk actions in the last 7 days</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, Calendar, CalendarDays, CheckCircle, Clock, FileText, Settings, Users } from "lucide-react";
import { useNavigate } from "react-router";
import type { LeaveOverview } from "@/types/leave";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

export default function LeaveDashboard() {
	const navigate = useNavigate();

	const { data: overview, isLoading } = useQuery({
		queryKey: ["leave-overview"],
		queryFn: async () => {
			const response = await axios.get("/api/leave/overview");
			return response.data.data as LeaveOverview;
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
						<CalendarDays className="h-6 w-6" />
						Leave Management
					</h1>
					<p className="text-muted-foreground">Manage employee leave balances and requests</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => navigate("/leave/settings")}>
						<Settings className="h-4 w-4 mr-2" />
						Leave Settings
					</Button>
					<Button variant="outline" onClick={() => navigate("/leave/calendar")}>
						<Calendar className="h-4 w-4 mr-2" />
						Calendar
					</Button>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-4">
				<Card
					className="cursor-pointer hover:shadow-md transition-shadow"
					onClick={() => navigate("/leave/requests?status=approved")}
				>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							On Leave Today
						</CardDescription>
						<CardTitle className="text-3xl">{overview?.employeesOnLeave ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">employees currently away</p>
					</CardContent>
				</Card>

				<Card
					className="cursor-pointer hover:shadow-md transition-shadow"
					onClick={() => navigate("/leave/requests?status=pending")}
				>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<Clock className="h-4 w-4" />
							Pending Approvals
						</CardDescription>
						<CardTitle className="text-3xl text-amber-600">{overview?.pendingApprovals ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">awaiting action</p>
					</CardContent>
				</Card>

				<Card
					className="cursor-pointer hover:shadow-md transition-shadow"
					onClick={() => navigate("/leave/balances?negativeOnly=true")}
				>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<AlertTriangle className="h-4 w-4" />
							Negative Balances
						</CardDescription>
						<CardTitle className="text-3xl text-destructive">{overview?.negativeBalances ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">need attention</p>
					</CardContent>
				</Card>

				<Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/leave/balances")}>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							Expiring Soon
						</CardDescription>
						<CardTitle className="text-3xl text-amber-600">{overview?.expiringBalances ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">balances expiring</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CalendarDays className="h-5 w-5" />
							Upcoming Leave
						</CardTitle>
						<CardDescription>Next 30 days</CardDescription>
					</CardHeader>
					<CardContent>
						{overview?.upcomingLeave && overview.upcomingLeave.length > 0 ? (
							<div className="space-y-3">
								{overview.upcomingLeave.map((leave) => (
									<div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg">
										<div>
											<p className="font-medium">{leave.employeeName}</p>
											<p className="text-sm text-muted-foreground">
												{leave.startDate} - {leave.endDate}
											</p>
										</div>
										<div className="text-right">
											<Badge variant="outline">{leave.leaveTypeName}</Badge>
											<p className="text-sm text-muted-foreground mt-1">{leave.days} day(s)</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-muted-foreground text-center py-8">No upcoming leave scheduled</p>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<Button variant="outline" className="w-full justify-start" onClick={() => navigate("/leave/requests")}>
							<FileText className="h-4 w-4 mr-2" />
							View All Requests
						</Button>
						<Button variant="outline" className="w-full justify-start" onClick={() => navigate("/leave/balances")}>
							<Users className="h-4 w-4 mr-2" />
							Employee Balances
						</Button>
						<Button variant="outline" className="w-full justify-start" onClick={() => navigate("/leave/request/new")}>
							<CheckCircle className="h-4 w-4 mr-2" />
							Submit Leave Request
						</Button>
						<Button variant="outline" className="w-full justify-start" onClick={() => navigate("/leave/my-leave")}>
							<CalendarDays className="h-4 w-4 mr-2" />
							My Leave
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

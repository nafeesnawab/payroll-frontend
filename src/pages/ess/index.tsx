import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CalendarDays, ChevronRight, FileText, Wallet } from "lucide-react";
import { useNavigate } from "react-router";
import type { ESSOverview } from "@/types/ess";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

export default function ESSDashboard() {
	const navigate = useNavigate();

	const { data: overview, isLoading } = useQuery({
		queryKey: ["ess-overview"],
		queryFn: async () => {
			const response = await axios.get("/api/ess/overview");
			return response.data.data as ESSOverview;
		},
	});

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<div className="grid gap-4 md:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-40" />
					))}
				</div>
			</div>
		);
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-ZA", {
			style: "currency",
			currency: "ZAR",
		}).format(amount);
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Welcome Back</h1>
				<p className="text-muted-foreground">Your employee self-service dashboard</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				{/* Latest Payslip Card */}
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<Wallet className="h-4 w-4" />
							Latest Payslip
						</CardDescription>
					</CardHeader>
					<CardContent>
						{overview?.latestPayslip ? (
							<div className="space-y-3">
								<div>
									<p className="text-2xl font-bold text-primary">{formatCurrency(overview.latestPayslip.netPay)}</p>
									<p className="text-sm text-muted-foreground">Net Pay</p>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">{overview.latestPayslip.payPeriod}</span>
									<Badge variant="outline">{overview.latestPayslip.payDate}</Badge>
								</div>
								<Button
									variant="outline"
									className="w-full"
									onClick={() => navigate(`/ess/payslips/${overview.latestPayslip?.id}`)}
								>
									View Payslip
									<ChevronRight className="h-4 w-4 ml-2" />
								</Button>
							</div>
						) : (
							<p className="text-muted-foreground py-4">No payslips available</p>
						)}
					</CardContent>
				</Card>

				{/* Leave Balances Card */}
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<CalendarDays className="h-4 w-4" />
							Leave Balances
						</CardDescription>
					</CardHeader>
					<CardContent>
						{overview?.leaveBalances && overview.leaveBalances.length > 0 ? (
							<div className="space-y-3">
								{overview.leaveBalances.slice(0, 3).map((balance) => (
									<div key={balance.leaveTypeId} className="flex items-center justify-between">
										<span className="text-sm">{balance.leaveTypeName}</span>
										<Badge variant={balance.available < 0 ? "destructive" : "secondary"}>
											{balance.available} days
										</Badge>
									</div>
								))}
								<Button variant="outline" className="w-full" onClick={() => navigate("/ess/leave")}>
									View All Leave
									<ChevronRight className="h-4 w-4 ml-2" />
								</Button>
							</div>
						) : (
							<p className="text-muted-foreground py-4">No leave balances</p>
						)}
					</CardContent>
				</Card>

				{/* Upcoming Leave Card */}
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<CalendarDays className="h-4 w-4" />
							Upcoming Leave
						</CardDescription>
					</CardHeader>
					<CardContent>
						{overview?.upcomingLeave && overview.upcomingLeave.length > 0 ? (
							<div className="space-y-3">
								{overview.upcomingLeave.slice(0, 2).map((leave) => (
									<div key={leave.id} className="border rounded-lg p-2">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium">{leave.leaveTypeName}</span>
											<Badge
												variant={
													leave.status === "approved"
														? "default"
														: leave.status === "pending"
															? "secondary"
															: "destructive"
												}
											>
												{leave.status}
											</Badge>
										</div>
										<p className="text-xs text-muted-foreground mt-1">
											{leave.startDate} - {leave.endDate} ({leave.days} days)
										</p>
									</div>
								))}
								<Button variant="outline" className="w-full" onClick={() => navigate("/ess/leave")}>
									View Leave
									<ChevronRight className="h-4 w-4 ml-2" />
								</Button>
							</div>
						) : (
							<div className="space-y-3">
								<p className="text-muted-foreground py-2">No upcoming leave</p>
								<Button variant="outline" className="w-full" onClick={() => navigate("/ess/leave/new")}>
									Apply for Leave
									<ChevronRight className="h-4 w-4 ml-2" />
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
					<CardDescription>Common tasks you can perform</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
						<Button
							variant="outline"
							className="h-auto py-4 flex flex-col items-center gap-2"
							onClick={() => navigate("/ess/payslips")}
						>
							<FileText className="h-6 w-6" />
							<span>View Payslips</span>
						</Button>
						<Button
							variant="outline"
							className="h-auto py-4 flex flex-col items-center gap-2"
							onClick={() => navigate("/ess/leave/new")}
						>
							<CalendarDays className="h-6 w-6" />
							<span>Apply for Leave</span>
						</Button>
						<Button
							variant="outline"
							className="h-auto py-4 flex flex-col items-center gap-2"
							onClick={() => navigate("/ess/profile")}
						>
							<Wallet className="h-6 w-6" />
							<span>Update Profile</span>
						</Button>
						<Button
							variant="outline"
							className="h-auto py-4 flex flex-col items-center gap-2"
							onClick={() => navigate("/ess/documents")}
						>
							<FileText className="h-6 w-6" />
							<span>Tax Certificates</span>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

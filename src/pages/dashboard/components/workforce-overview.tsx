import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertCircle, Cake, Calendar, Medal, TrendingDown, TrendingUp, UserCheck, Users } from "lucide-react";
import { useNavigate } from "react-router";

interface WorkforceData {
	activeEmployees: number;
	newHires: number;
	terminations: number;
	employeesWithErrors: number;
	upcomingLeave: number;
	birthdays: Array<{ name: string; date: string }>;
	anniversaries: Array<{ name: string; years: number; date: string }>;
}

interface StatCardProps {
	icon: typeof Users;
	label: string;
	value: number;
	trend?: "up" | "down";
	variant?: "default" | "success" | "warning" | "danger";
	onClick?: () => void;
}

function StatCard({ icon: Icon, label, value, trend, variant = "default", onClick }: StatCardProps) {
	const variantStyles = {
		default: "bg-muted/50",
		success: "bg-green-500/10",
		warning: "bg-orange-500/10",
		danger: "bg-red-500/10",
	};

	const iconStyles = {
		default: "text-muted-foreground",
		success: "text-green-600 dark:text-green-400",
		warning: "text-orange-600 dark:text-orange-400",
		danger: "text-red-600 dark:text-red-400",
	};

	return (
		<button
			type="button"
			onClick={onClick}
			className={`p-4 rounded-lg ${variantStyles[variant]} text-left transition-all hover:ring-2 hover:ring-primary/20 w-full`}
		>
			<div className="flex items-center justify-between">
				<Icon className={`h-5 w-5 ${iconStyles[variant]}`} />
				{trend && (
					<span className={trend === "up" ? "text-green-600" : "text-red-600"}>
						{trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
					</span>
				)}
			</div>
			<p className="text-2xl font-bold mt-2">{value}</p>
			<p className="text-sm text-muted-foreground">{label}</p>
		</button>
	);
}

export function WorkforceOverviewWidget() {
	const navigate = useNavigate();

	const { data, isLoading, error } = useQuery({
		queryKey: ["dashboard", "workforce"],
		queryFn: async () => {
			const response = await axios.get("/api/dashboard/workforce");
			return response.data.data as WorkforceData;
		},
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Workforce Overview
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4">
						{[1, 2, 3, 4].map((i) => (
							<Skeleton key={i} className="h-24" />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error || !data) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Workforce Overview
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Failed to load workforce data</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Users className="h-5 w-5" />
					Workforce Overview
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-3">
					<StatCard
						icon={UserCheck}
						label="Active Employees"
						value={data.activeEmployees}
						onClick={() => navigate("/employees")}
					/>
					<StatCard
						icon={TrendingUp}
						label="New Hires"
						value={data.newHires}
						variant="success"
						trend={data.newHires > 0 ? "up" : undefined}
						onClick={() => navigate("/employees?filter=new")}
					/>
					<StatCard
						icon={TrendingDown}
						label="Terminations"
						value={data.terminations}
						variant={data.terminations > 0 ? "warning" : "default"}
						onClick={() => navigate("/employees?filter=terminated")}
					/>
					<StatCard
						icon={AlertCircle}
						label="With Errors"
						value={data.employeesWithErrors}
						variant={data.employeesWithErrors > 0 ? "danger" : "default"}
						onClick={() => navigate("/employees?filter=errors")}
					/>
				</div>

				<div className="border-t pt-4 space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm font-medium">Upcoming Leave</span>
						</div>
						<Badge variant="secondary">{data.upcomingLeave}</Badge>
					</div>

					{data.birthdays.length > 0 && (
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Cake className="h-4 w-4 text-pink-500" />
								<span className="text-sm">
									<span className="font-medium">{data.birthdays[0].name}</span>
									<span className="text-muted-foreground"> - Birthday soon</span>
								</span>
							</div>
						</div>
					)}

					{data.anniversaries.length > 0 && (
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Medal className="h-4 w-4 text-amber-500" />
								<span className="text-sm">
									<span className="font-medium">{data.anniversaries[0].name}</span>
									<span className="text-muted-foreground">
										{" "}
										- {data.anniversaries[0].years} year{data.anniversaries[0].years > 1 ? "s" : ""}
									</span>
								</span>
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

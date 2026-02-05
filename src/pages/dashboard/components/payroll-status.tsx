import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Progress } from "@/ui/progress";
import { Skeleton } from "@/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertCircle, Calendar, CheckCircle2, DollarSign, Play, Users } from "lucide-react";
import { useNavigate } from "react-router";

interface PayrollStatusData {
	period: string;
	frequency: string;
	processedCount: number;
	totalEmployees: number;
	errors: number;
	netPay: number;
	status: "ready" | "in_progress" | "not_started";
	payDate: string;
}

const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("en-ZA", {
		style: "currency",
		currency: "ZAR",
		minimumFractionDigits: 0,
	}).format(amount);
};

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString("en-ZA", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
};

export function PayrollStatusWidget() {
	const navigate = useNavigate();

	const { data, isLoading, error } = useQuery({
		queryKey: ["dashboard", "payroll-status"],
		queryFn: async () => {
			const response = await axios.get("/api/dashboard/payroll-status");
			return response.data.data as PayrollStatusData;
		},
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<DollarSign className="h-5 w-5" />
						Payroll Status
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-8 w-full" />
					<div className="grid grid-cols-2 gap-4">
						<Skeleton className="h-16" />
						<Skeleton className="h-16" />
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
						<DollarSign className="h-5 w-5" />
						Payroll Status
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Failed to load payroll data</p>
				</CardContent>
			</Card>
		);
	}

	const progress = data.totalEmployees > 0 ? (data.processedCount / data.totalEmployees) * 100 : 0;
	const hasErrors = data.errors > 0;
	const isComplete = data.processedCount === data.totalEmployees && !hasErrors;

	return (
		<Card className={hasErrors ? "border-orange-500/50" : ""}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<DollarSign className="h-5 w-5" />
						Payroll Status
					</CardTitle>
					<Badge variant={isComplete ? "default" : "secondary"}>
						{data.period} • {data.frequency}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Processing Progress</span>
						<span className="font-medium">
							{data.processedCount} / {data.totalEmployees} employees
						</span>
					</div>
					<Progress value={progress} className="h-2" />
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="rounded-lg bg-muted/50 p-3">
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<Users className="h-4 w-4" />
							Processed
						</div>
						<p className="text-2xl font-bold mt-1">{data.processedCount}</p>
					</div>
					<div className="rounded-lg bg-muted/50 p-3">
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<DollarSign className="h-4 w-4" />
							Net Pay
						</div>
						<p className="text-2xl font-bold mt-1">{formatCurrency(data.netPay)}</p>
					</div>
				</div>

				{hasErrors && (
					<div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
						<AlertCircle className="h-4 w-4" />
						<span className="text-sm font-medium">
							{data.errors} employee{data.errors > 1 ? "s" : ""} with errors
						</span>
						<Button
							variant="link"
							size="sm"
							className="ml-auto text-orange-600 dark:text-orange-400 p-0 h-auto"
							onClick={() => navigate("/employees?filter=errors")}
						>
							View
						</Button>
					</div>
				)}

				<div className="flex items-center justify-between pt-2 border-t">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Calendar className="h-4 w-4" />
						Pay date: {formatDate(data.payDate)}
					</div>
					<div className="flex gap-2">
						<Button variant="outline" size="sm" onClick={() => navigate("/payroll")}>
							<Play className="h-4 w-4 mr-1" />
							Go to Payrun
						</Button>
						{isComplete && (
							<Button size="sm" onClick={() => navigate("/payroll/finalize")}>
								<CheckCircle2 className="h-4 w-4 mr-1" />
								Finalize
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

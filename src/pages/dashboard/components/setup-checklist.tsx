import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Progress } from "@/ui/progress";
import { Skeleton } from "@/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CheckCircle2, Circle, Rocket } from "lucide-react";
import { useNavigate } from "react-router";

interface SetupStep {
	key: string;
	label: string;
	complete: boolean;
	route: string;
}

interface SetupProgressData {
	employerDetailsComplete: boolean;
	bankDetailsComplete: boolean;
	employeesAdded: boolean;
	firstPayrollRun: boolean;
	completionPercentage: number;
	steps: SetupStep[];
}

export function SetupChecklistWidget() {
	const navigate = useNavigate();

	const { data, isLoading, error } = useQuery({
		queryKey: ["dashboard", "setup-progress"],
		queryFn: async () => {
			const response = await axios.get("/api/dashboard/setup-progress");
			return response.data.data as SetupProgressData;
		},
	});

	if (isLoading) {
		return (
			<Card className="border-primary/50 bg-primary/5">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Rocket className="h-5 w-5" />
						Getting Started
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-2 w-full" />
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-10 w-full" />
					))}
				</CardContent>
			</Card>
		);
	}

	if (error || !data) {
		return null;
	}

	if (data.completionPercentage === 100) {
		return null;
	}

	const nextIncompleteStep = data.steps.find((step) => !step.complete);

	return (
		<Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Rocket className="h-5 w-5 text-primary" />
						Getting Started
					</CardTitle>
					<span className="text-sm font-medium text-primary">{data.completionPercentage}% complete</span>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Progress value={data.completionPercentage} className="h-2" />
					<p className="text-sm text-muted-foreground">Complete these steps to start processing payroll</p>
				</div>

				<div className="space-y-2">
					{data.steps.map((step) => (
						<button
							key={step.key}
							type="button"
							onClick={() => navigate(step.route)}
							className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
								step.complete ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-muted/50 hover:bg-muted"
							}`}
						>
							{step.complete ? (
								<CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
							) : (
								<Circle className="h-5 w-5 text-muted-foreground" />
							)}
							<span className={step.complete ? "line-through opacity-70" : "font-medium"}>{step.label}</span>
						</button>
					))}
				</div>

				{nextIncompleteStep && (
					<Button className="w-full" onClick={() => navigate(nextIncompleteStep.route)}>
						Continue: {nextIncompleteStep.label}
					</Button>
				)}
			</CardContent>
		</Card>
	);
}

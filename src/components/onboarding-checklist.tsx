import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CheckCircle, Circle, Rocket, X } from "lucide-react";
import { useNavigate } from "react-router";
import type { OnboardingProgress } from "@/types/help";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Progress } from "@/ui/progress";

export function OnboardingChecklist() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: progress, isLoading } = useQuery({
		queryKey: ["onboarding-progress"],
		queryFn: async () => {
			const response = await axios.get("/api/help/onboarding");
			return response.data.data as OnboardingProgress;
		},
	});

	const dismissChecklist = useMutation({
		mutationFn: async () => {
			const response = await axios.post("/api/help/onboarding/dismiss");
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["onboarding-progress"] });
		},
	});

	if (isLoading || !progress || progress.isDismissed || progress.percentComplete === 100) {
		return null;
	}

	return (
		<Card className="border-primary/20 bg-primary/5">
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Rocket className="h-5 w-5 text-primary" />
						<CardTitle className="text-base">Getting Started</CardTitle>
					</div>
					<Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => dismissChecklist.mutate()}>
						<X className="h-4 w-4" />
					</Button>
				</div>
				<CardDescription>Complete these steps to set up your payroll</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-1">
					<div className="flex justify-between text-sm">
						<span>
							{progress.completedSteps} of {progress.totalSteps} completed
						</span>
						<span className="font-medium">{progress.percentComplete}%</span>
					</div>
					<Progress value={progress.percentComplete} className="h-2" />
				</div>

				<div className="space-y-2">
					{progress.steps.map((step) => (
						<button
							key={step.id}
							type="button"
							className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
								step.isCompleted ? "text-muted-foreground" : "hover:bg-primary/10"
							}`}
							onClick={() => step.route && !step.isCompleted && navigate(step.route)}
							disabled={step.isCompleted}
						>
							{step.isCompleted ? (
								<CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
							) : (
								<Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
							)}
							<div>
								<p className={`text-sm font-medium ${step.isCompleted ? "line-through" : ""}`}>{step.title}</p>
								<p className="text-xs text-muted-foreground">{step.description}</p>
							</div>
						</button>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

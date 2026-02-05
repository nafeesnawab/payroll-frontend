import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { FileText, Play, Plus, Users, Zap } from "lucide-react";
import { useNavigate } from "react-router";

interface QuickAction {
	icon: typeof Play;
	label: string;
	description: string;
	route: string;
	variant?: "default" | "outline";
}

const actions: QuickAction[] = [
	{
		icon: Play,
		label: "Run Payroll",
		description: "Process current period",
		route: "/payroll",
		variant: "default",
	},
	{
		icon: Plus,
		label: "Add Employee",
		description: "Create new employee",
		route: "/employees/new",
		variant: "outline",
	},
	{
		icon: FileText,
		label: "Submit Filing",
		description: "EMP201, UIF, etc.",
		route: "/reports",
		variant: "outline",
	},
	{
		icon: Users,
		label: "View Employees",
		description: "Manage workforce",
		route: "/employees",
		variant: "outline",
	},
];

export function QuickActionsWidget() {
	const navigate = useNavigate();

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Zap className="h-5 w-5" />
					Quick Actions
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-3">
					{actions.map((action) => {
						const Icon = action.icon;
						return (
							<Button
								key={action.label}
								variant={action.variant}
								className="h-auto py-4 flex-col items-start text-left"
								onClick={() => navigate(action.route)}
							>
								<Icon className="h-5 w-5 mb-2" />
								<span className="font-medium">{action.label}</span>
								<span className="text-xs opacity-70 font-normal">{action.description}</span>
							</Button>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

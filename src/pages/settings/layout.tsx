import { Badge } from "@/ui/badge";
import { cn } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
	Banknote,
	Bell,
	Building2,
	Calculator,
	Calendar,
	CheckCircle2,
	Circle,
	Clock,
	FileText,
	Hash,
	Link2,
	Settings,
	Sliders,
	Users,
	Wallet,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router";

interface NavItem {
	label: string;
	path: string;
	icon: typeof Settings;
	required?: boolean;
}

const navGroups: { title: string; items: NavItem[] }[] = [
	{
		title: "Company",
		items: [
			{ label: "Employer Details", path: "/settings/employer", icon: Building2, required: true },
			{ label: "Banking & EFT", path: "/settings/banking", icon: Banknote, required: true },
			{ label: "Users & Permissions", path: "/settings/users", icon: Users },
		],
	},
	{
		title: "Payroll Setup",
		items: [
			{ label: "Pay Frequencies", path: "/settings/pay-frequencies", icon: Clock, required: true },
			{ label: "Pay Points", path: "/settings/pay-points", icon: Hash },
			{ label: "Job Grades", path: "/settings/job-grades", icon: Sliders },
			{ label: "Payroll Items", path: "/settings/payroll-items", icon: Wallet },
			{ label: "Salary Rules", path: "/settings/salary-rules", icon: Calculator, required: true },
		],
	},
	{
		title: "Leave & Time",
		items: [
			{ label: "Leave Types", path: "/settings/leave", icon: Calendar, required: true },
		],
	},
	{
		title: "Documents",
		items: [
			{ label: "Payslip Config", path: "/settings/payslips", icon: FileText },
			{ label: "Employee Numbers", path: "/settings/employee-numbers", icon: Hash },
		],
	},
	{
		title: "Integrations",
		items: [
			{ label: "Beneficiaries", path: "/settings/beneficiaries", icon: Link2 },
			{ label: "Notifications", path: "/settings/notifications", icon: Bell },
		],
	},
];

interface SettingsCompletion {
	employer: boolean;
	banking: boolean;
	payFrequencies: boolean;
	leaveTypes: boolean;
	salaryRules: boolean;
	percentage: number;
}

export default function SettingsLayout() {
	const location = useLocation();

	const { data: completion } = useQuery({
		queryKey: ["settings", "completion"],
		queryFn: async () => {
			const response = await axios.get("/api/settings/completion");
			return response.data.data as SettingsCompletion;
		},
	});

	const isComplete = (path: string): boolean | undefined => {
		if (!completion) return undefined;
		if (path.includes("employer")) return completion.employer;
		if (path.includes("banking")) return completion.banking;
		if (path.includes("pay-frequencies")) return completion.payFrequencies;
		if (path.includes("leave")) return completion.leaveTypes;
		if (path.includes("salary-rules")) return completion.salaryRules;
		return true;
	};

	return (
		<div className="flex h-full">
			<aside className="w-64 border-r bg-muted/30 overflow-y-auto">
				<div className="p-4 border-b">
					<h2 className="font-semibold flex items-center gap-2">
						<Settings className="h-5 w-5" />
						Settings
					</h2>
					{completion && completion.percentage < 100 && (
						<Badge variant="secondary" className="mt-2">
							{completion.percentage}% complete
						</Badge>
					)}
				</div>

				<nav className="p-2">
					{navGroups.map((group) => (
						<div key={group.title} className="mb-4">
							<p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
								{group.title}
							</p>
							{group.items.map((item) => {
								const Icon = item.icon;
								const complete = isComplete(item.path);
								const isActive = location.pathname === item.path;

								return (
									<NavLink
										key={item.path}
										to={item.path}
										className={cn(
											"flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
											isActive
												? "bg-primary text-primary-foreground"
												: "hover:bg-muted text-foreground"
										)}
									>
										<Icon className="h-4 w-4 flex-shrink-0" />
										<span className="flex-1 truncate">{item.label}</span>
										{item.required && complete === false && (
											<Circle className="h-3 w-3 text-orange-500" />
										)}
										{item.required && complete === true && (
											<CheckCircle2 className="h-3 w-3 text-green-500" />
										)}
									</NavLink>
								);
							})}
						</div>
					))}
				</nav>
			</aside>

			<main className="flex-1 overflow-y-auto">
				<Outlet />
			</main>
		</div>
	);
}

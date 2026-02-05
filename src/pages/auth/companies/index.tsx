import { Building2, ChevronRight, Plus, Shield, User } from "lucide-react";
import { Navigate, useNavigate } from "react-router";
import { toast } from "sonner";
import Logo from "@/components/logo";
import { GLOBAL_CONFIG } from "@/global-config";
import { useAuthActions, useAuthCompanies, useAuthToken, useIsAuthenticated } from "@/store/authStore";
import type { UserCompany } from "@/types/auth";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";

const roleIcons: Record<string, typeof User> = {
	owner: Shield,
	admin: Shield,
	payroll_admin: User,
	viewer: User,
};

const roleLabels: Record<string, string> = {
	owner: "Owner",
	admin: "Admin",
	payroll_admin: "Payroll Admin",
	viewer: "Viewer",
};

export default function CompanySelectionPage() {
	const navigate = useNavigate();
	const isAuthenticated = useIsAuthenticated();
	const token = useAuthToken();
	const companies = useAuthCompanies();
	const { setActiveCompany, setOnboardingComplete } = useAuthActions();

	if (!isAuthenticated || !token) {
		return <Navigate to="/auth/login" replace />;
	}

	if (companies.length === 0) {
		return <Navigate to="/auth/login" replace />;
	}

	if (companies.length === 1) {
		setActiveCompany(companies[0].company, companies[0].role as any);
		return <Navigate to={GLOBAL_CONFIG.defaultRoute} replace />;
	}

	const handleSelectCompany = (userCompany: UserCompany) => {
		setActiveCompany(userCompany.company, userCompany.role);
		setOnboardingComplete(true);
		toast.success(`Switched to ${userCompany.company.name}`);
		navigate(GLOBAL_CONFIG.defaultRoute, { replace: true });
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
			<Card className="w-full max-w-lg">
				<CardHeader className="text-center space-y-4">
					<div className="flex justify-center">
						<div className="flex items-center gap-2">
							<Logo size={32} />
							<span className="text-xl font-bold">{GLOBAL_CONFIG.appName}</span>
						</div>
					</div>
					<div>
						<CardTitle className="text-2xl">Select a Company</CardTitle>
						<CardDescription className="mt-2">Choose which company you'd like to work with</CardDescription>
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					{companies.map((userCompany) => {
						const RoleIcon = roleIcons[userCompany.role] || User;
						return (
							<button
								key={userCompany.companyId}
								type="button"
								onClick={() => handleSelectCompany(userCompany)}
								className="w-full flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all group text-left"
							>
								<div className="flex-shrink-0 rounded-full bg-primary/10 p-3">
									<Building2 className="h-6 w-6 text-primary" />
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-foreground truncate">{userCompany.company.name}</h3>
									<div className="flex items-center gap-1 text-sm text-muted-foreground">
										<RoleIcon className="h-3 w-3" />
										<span>{roleLabels[userCompany.role] || userCompany.role}</span>
									</div>
								</div>
								<ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
							</button>
						);
					})}

					<div className="pt-4 border-t border-border">
						<Button variant="outline" className="w-full" onClick={() => toast.info("Create new company - coming soon")}>
							<Plus className="mr-2 h-4 w-4" />
							Create New Company
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

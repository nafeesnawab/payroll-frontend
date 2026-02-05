import { useActiveCompany } from "@/store/authStore";
import { ComplianceStatusWidget } from "./components/compliance-status";
import { NotificationsWidget } from "./components/notifications";
import { PayrollStatusWidget } from "./components/payroll-status";
import { QuickActionsWidget } from "./components/quick-actions";
import { SetupChecklistWidget } from "./components/setup-checklist";
import { WorkforceOverviewWidget } from "./components/workforce-overview";

export default function Dashboard() {
	const activeCompany = useActiveCompany();

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Dashboard</h1>
					{activeCompany && <p className="text-muted-foreground">{activeCompany.name}</p>}
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Left Column - Main Content */}
				<div className="lg:col-span-2 space-y-6">
					{/* Setup Checklist - Shows only if onboarding incomplete */}
					<SetupChecklistWidget />

					{/* Payroll Status */}
					<PayrollStatusWidget />

					{/* Compliance Status */}
					<ComplianceStatusWidget />
				</div>

				{/* Right Column - Secondary Content */}
				<div className="space-y-6">
					{/* Quick Actions */}
					<QuickActionsWidget />

					{/* Workforce Overview */}
					<WorkforceOverviewWidget />

					{/* Notifications */}
					<NotificationsWidget />
				</div>
			</div>
		</div>
	);
}

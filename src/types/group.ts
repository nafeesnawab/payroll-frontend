export type CompanyStatus = "active" | "suspended" | "pending";

export type GroupRole = "group_owner" | "group_admin" | "company_admin" | "payroll_officer";

export type SettingScope = "group" | "company";

export type InheritanceMode = "enforced" | "override_allowed" | "company_only";

export interface GroupOverview {
	groupId: string;
	groupName: string;
	totalCompanies: number;
	totalEmployees: number;
	activePayrolls: number;
	complianceAlerts: number;
	billingStatus: "current" | "overdue" | "suspended";
}

export interface GroupCompany {
	id: string;
	legalName: string;
	tradingName: string;
	registrationNumber: string;
	payeNumber: string;
	uifNumber: string;
	sdlNumber: string;
	status: CompanyStatus;
	employeeCount: number;
	lastPayrollRun?: string;
	createdAt: string;
}

export interface GroupSetting {
	id: string;
	name: string;
	category: string;
	inheritanceMode: InheritanceMode;
	groupValue: string | boolean | number;
	description: string;
}

export interface CompanyOverride {
	settingId: string;
	settingName: string;
	inheritedValue: string | boolean | number;
	overriddenValue: string | boolean | number;
	overriddenAt: string;
	overriddenBy: string;
}

export interface EmployeeTransfer {
	id: string;
	employeeId: string;
	employeeName: string;
	employeeNumber: string;
	sourceCompanyId: string;
	sourceCompanyName: string;
	destinationCompanyId: string;
	destinationCompanyName: string;
	effectiveDate: string;
	status: "pending" | "completed" | "cancelled";
	preserveLeaveBalances: boolean;
	preserveServiceDate: boolean;
	resetTaxYear: boolean;
	createdBy: string;
	createdAt: string;
	completedAt?: string;
}

export interface TransferImpact {
	leaveBalances: Array<{ type: string; balance: number }>;
	serviceYears: number;
	currentSalary: number;
	taxYearEarnings: number;
	warnings: string[];
}

export interface CreateTransferInput {
	employeeId: string;
	sourceCompanyId: string;
	destinationCompanyId: string;
	effectiveDate: string;
	preserveLeaveBalances: boolean;
	preserveServiceDate: boolean;
	resetTaxYear: boolean;
}

export interface CreateCompanyInput {
	legalName: string;
	tradingName: string;
	registrationNumber: string;
	payeNumber: string;
	uifNumber: string;
	sdlNumber: string;
}

export interface GroupBilling {
	billingModel: "per_company" | "per_employee" | "hybrid";
	totalMonthly: number;
	companies: Array<{
		companyId: string;
		companyName: string;
		employeeCount: number;
		monthlyCost: number;
	}>;
	nextBillingDate: string;
	paymentStatus: "current" | "overdue" | "suspended";
}

export interface ConsolidatedReport {
	totalPayrollCost: number;
	totalHeadcount: number;
	byCompany: Array<{
		companyId: string;
		companyName: string;
		payrollCost: number;
		headcount: number;
		complianceStatus: "compliant" | "warning" | "non_compliant";
	}>;
}

export const GROUP_ROLE_LABELS: Record<GroupRole, string> = {
	group_owner: "Group Owner",
	group_admin: "Group Admin",
	company_admin: "Company Admin",
	payroll_officer: "Payroll Officer",
};

export const SETTING_CATEGORIES = [
	"Payroll Items",
	"Leave Types",
	"Holiday Rules",
	"Working Calendar",
	"Pay Frequencies",
	"Accounting Integration",
];

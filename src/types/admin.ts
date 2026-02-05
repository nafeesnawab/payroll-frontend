export type AdminRole = "super_admin" | "support_agent" | "auditor";

export type AdminUserStatus = "active" | "disabled" | "pending";

export type JobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export type FeatureStatus = "off" | "beta" | "on";

export type FeatureScope = "global" | "group" | "company";

export type SubscriptionPlan = "starter" | "professional" | "enterprise";

export type BillingStatus = "active" | "overdue" | "suspended" | "cancelled";

export interface PlatformOverview {
	activeCompanies: number;
	activeEmployees: number;
	payrollsProcessedThisMonth: number;
	errorRate: number;
	newSignupsThisWeek: number;
	failedPayrollRuns: number;
	systemAlerts: number;
}

export interface RecentActivity {
	id: string;
	type: "signup" | "payroll_failed" | "system_alert" | "suspension";
	description: string;
	companyName?: string;
	timestamp: string;
	severity: "info" | "warning" | "error";
}

export interface AdminUser {
	id: string;
	name: string;
	email: string;
	role: AdminRole;
	status: AdminUserStatus;
	lastLogin?: string;
	createdAt: string;
}

export interface SystemSettings {
	payroll: {
		defaultTaxYear: string;
		calculationPrecision: number;
		roundingRule: "round" | "floor" | "ceil";
	};
	compliance: {
		defaultPayeRate: number;
		defaultUifRate: number;
		defaultSdlRate: number;
		filingWindowDays: number;
	};
	security: {
		minPasswordLength: number;
		require2FA: boolean;
		sessionTimeoutMinutes: number;
		maxLoginAttempts: number;
	};
	performance: {
		maxBackgroundJobs: number;
		maxFileUploadMB: number;
		maxImportRows: number;
	};
}

export interface PlatformCompany {
	id: string;
	name: string;
	registrationNumber: string;
	payeReference: string;
	subscriptionPlan: SubscriptionPlan;
	billingStatus: BillingStatus;
	employeeCount: number;
	lastPayrollDate?: string;
	createdAt: string;
	status: "active" | "suspended";
}

export interface BackgroundJob {
	id: string;
	type: "payroll_calculation" | "import" | "export" | "notification" | "filing";
	typeLabel: string;
	companyName: string;
	status: JobStatus;
	progress: number;
	startedAt: string;
	completedAt?: string;
	errorMessage?: string;
	retryCount: number;
}

export interface FeatureFlag {
	id: string;
	name: string;
	description: string;
	status: FeatureStatus;
	scope: FeatureScope;
	rolloutPercentage: number;
	updatedAt: string;
	updatedBy: string;
}

export interface CompanyBilling {
	companyId: string;
	companyName: string;
	plan: SubscriptionPlan;
	billingCycle: "monthly" | "annual";
	monthlyAmount: number;
	employeeCount: number;
	usageMetrics: {
		payrollRuns: number;
		employees: number;
		storageUsedMB: number;
	};
	status: BillingStatus;
	nextBillingDate: string;
	discountPercent: number;
}

export interface AdminAuditLog {
	id: string;
	action: string;
	category: "login" | "settings" | "impersonation" | "suspension" | "feature_toggle" | "billing";
	userId: string;
	userName: string;
	targetId?: string;
	targetName?: string;
	details: string;
	ipAddress: string;
	timestamp: string;
}

export interface EmergencyControl {
	id: string;
	name: string;
	description: string;
	isActive: boolean;
	activatedAt?: string;
	activatedBy?: string;
	reason?: string;
}

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
	super_admin: "Super Admin",
	support_agent: "Support Agent",
	auditor: "Read-only Auditor",
};

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
	starter: "Starter",
	professional: "Professional",
	enterprise: "Enterprise",
};

export const JOB_TYPE_LABELS: Record<BackgroundJob["type"], string> = {
	payroll_calculation: "Payroll Calculation",
	import: "Data Import",
	export: "Data Export",
	notification: "Notification",
	filing: "Statutory Filing",
};

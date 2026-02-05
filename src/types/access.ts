export type UserStatus = "active" | "invited" | "suspended";

export type PermissionAction = "view" | "create" | "edit" | "delete" | "finalize" | "submit";

export type ModuleName = 
	| "dashboard"
	| "employees"
	| "payroll"
	| "leave"
	| "filings"
	| "terminations"
	| "ess"
	| "settings"
	| "access"
	| "audit";

export interface Permission {
	module: ModuleName;
	actions: PermissionAction[];
}

export interface Role {
	id: string;
	name: string;
	description: string;
	isSystemRole: boolean;
	userCount: number;
	permissions: Permission[];
	createdAt: string;
	updatedAt: string;
}

export interface SystemUser {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	status: UserStatus;
	roles: string[];
	roleNames: string[];
	companyAccess: "all" | "specific";
	companyIds?: string[];
	lastLoginAt?: string;
	invitedAt?: string;
	createdAt: string;
}

export interface AccessOverview {
	totalUsers: number;
	activeUsers: number;
	invitedUsers: number;
	suspendedUsers: number;
	totalRoles: number;
	usersWithAdminAccess: number;
	recentHighRiskActions: Array<{
		id: string;
		action: string;
		user: string;
		timestamp: string;
	}>;
}

export interface InviteUserInput {
	email: string;
	firstName: string;
	lastName: string;
	roleIds: string[];
	companyAccess: "all" | "specific";
	companyIds?: string[];
}

export interface UpdateUserInput {
	firstName?: string;
	lastName?: string;
	roleIds?: string[];
	status?: UserStatus;
	companyAccess?: "all" | "specific";
	companyIds?: string[];
}

export interface CreateRoleInput {
	name: string;
	description: string;
	permissions: Permission[];
}

export interface UpdateRoleInput {
	name?: string;
	description?: string;
	permissions?: Permission[];
}

export type AuditActionType =
	| "login"
	| "logout"
	| "payroll_create"
	| "payroll_edit"
	| "payroll_finalize"
	| "payroll_delete"
	| "filing_submit"
	| "filing_edit"
	| "termination_create"
	| "termination_finalize"
	| "leave_approve"
	| "leave_reject"
	| "role_create"
	| "role_edit"
	| "role_delete"
	| "user_invite"
	| "user_update"
	| "user_suspend"
	| "user_delete"
	| "permission_change"
	| "settings_update"
	| "employee_create"
	| "employee_edit"
	| "employee_delete";

export interface AuditLog {
	id: string;
	timestamp: string;
	userId: string;
	userName: string;
	userEmail: string;
	action: AuditActionType;
	actionLabel: string;
	module: ModuleName;
	entityType: string;
	entityId?: string;
	entityName?: string;
	ipAddress: string;
	userAgent?: string;
	isHighRisk: boolean;
}

export interface AuditLogDetail extends AuditLog {
	beforeData?: Record<string, unknown>;
	afterData?: Record<string, unknown>;
	metadata?: Record<string, unknown>;
}

export interface AuditLogFilters {
	startDate?: string;
	endDate?: string;
	userId?: string;
	action?: AuditActionType;
	module?: ModuleName;
	isHighRisk?: boolean;
}

export const MODULE_LABELS: Record<ModuleName, string> = {
	dashboard: "Dashboard",
	employees: "Employees",
	payroll: "Payroll",
	leave: "Leave",
	filings: "Filings",
	terminations: "Terminations",
	ess: "Employee Self-Service",
	settings: "Settings",
	access: "Access Control",
	audit: "Audit Logs",
};

export const PERMISSION_LABELS: Record<PermissionAction, string> = {
	view: "View",
	create: "Create",
	edit: "Edit",
	delete: "Delete",
	finalize: "Finalize",
	submit: "Submit",
};

export const HIGH_RISK_ACTIONS: AuditActionType[] = [
	"payroll_finalize",
	"payroll_delete",
	"filing_submit",
	"termination_finalize",
	"role_delete",
	"user_delete",
	"user_suspend",
	"permission_change",
];

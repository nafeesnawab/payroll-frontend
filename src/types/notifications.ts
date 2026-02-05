export type NotificationChannel = "email" | "in_app" | "sms";

export type NotificationStatus = "sent" | "failed" | "pending" | "read";

export type NotificationType =
	| "payroll_ready"
	| "payroll_finalized"
	| "payslip_released"
	| "leave_submitted"
	| "leave_approved"
	| "leave_rejected"
	| "filing_due"
	| "filing_rejected"
	| "termination_completed"
	| "profile_change_submitted"
	| "profile_change_approved"
	| "system_alert";

export type NotificationCategory = "payroll" | "leave" | "filings" | "general";

export type RecipientType = "admins" | "managers" | "employees" | "specific";

export interface NotificationOverview {
	sentThisPeriod: number;
	failedCount: number;
	activeAutomations: number;
	pendingCount: number;
}

export interface NotificationLog {
	id: string;
	type: NotificationType;
	typeLabel: string;
	recipientId: string;
	recipientName: string;
	recipientEmail: string;
	channel: NotificationChannel;
	status: NotificationStatus;
	subject: string;
	sentAt: string;
	errorMessage?: string;
}

export interface NotificationSetting {
	id: string;
	type: NotificationType;
	typeLabel: string;
	description: string;
	category: NotificationCategory;
	enabled: boolean;
	isCritical: boolean;
	recipients: RecipientType[];
	channels: NotificationChannel[];
	timing: "immediate" | "scheduled";
	scheduleTime?: string;
}

export interface UserNotificationPreference {
	category: NotificationCategory;
	categoryLabel: string;
	emailEnabled: boolean;
	inAppEnabled: boolean;
}

export type AutomationTrigger =
	| "payroll_finalized"
	| "leave_approved"
	| "leave_rejected"
	| "filing_status_changed"
	| "employee_created"
	| "employee_terminated"
	| "schedule"
	| "payslip_released";

export type AutomationAction = "send_notification" | "generate_document" | "change_status" | "send_reminder";

export type AutomationStatus = "active" | "paused" | "draft";

export interface AutomationCondition {
	field: string;
	operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
	value: string;
}

export interface AutomationRule {
	id: string;
	name: string;
	description: string;
	trigger: AutomationTrigger;
	triggerLabel: string;
	conditions: AutomationCondition[];
	action: AutomationAction;
	actionLabel: string;
	actionConfig: Record<string, unknown>;
	status: AutomationStatus;
	lastTriggeredAt?: string;
	triggerCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface CreateAutomationInput {
	name: string;
	description: string;
	trigger: AutomationTrigger;
	conditions: AutomationCondition[];
	action: AutomationAction;
	actionConfig: Record<string, unknown>;
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
	payroll_ready: "Payroll Ready to Calculate",
	payroll_finalized: "Payroll Finalized",
	payslip_released: "Payslip Released",
	leave_submitted: "Leave Request Submitted",
	leave_approved: "Leave Approved",
	leave_rejected: "Leave Rejected",
	filing_due: "Filing Due Reminder",
	filing_rejected: "Filing Rejected",
	termination_completed: "Termination Completed",
	profile_change_submitted: "Profile Change Submitted",
	profile_change_approved: "Profile Change Approved",
	system_alert: "System Alert",
};

export const TRIGGER_LABELS: Record<AutomationTrigger, string> = {
	payroll_finalized: "Payroll Finalized",
	leave_approved: "Leave Approved",
	leave_rejected: "Leave Rejected",
	filing_status_changed: "Filing Status Changed",
	employee_created: "Employee Created",
	employee_terminated: "Employee Terminated",
	schedule: "Scheduled Time",
	payslip_released: "Payslip Released",
};

export const ACTION_LABELS: Record<AutomationAction, string> = {
	send_notification: "Send Notification",
	generate_document: "Generate Document",
	change_status: "Change Status",
	send_reminder: "Send Reminder",
};

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
	payroll: "Payroll",
	leave: "Leave",
	filings: "Filings",
	general: "General",
};

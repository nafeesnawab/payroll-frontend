import { faker } from "@faker-js/faker";
import { http, HttpResponse, delay } from "msw";
import type {
	NotificationOverview,
	NotificationLog,
	NotificationSetting,
	UserNotificationPreference,
	AutomationRule,
	NotificationType,
	NotificationChannel,
	NotificationStatus,
} from "@/types/notifications";
import { NOTIFICATION_TYPE_LABELS, TRIGGER_LABELS, ACTION_LABELS } from "@/types/notifications";

const notificationSettings: NotificationSetting[] = [
	{
		id: "ns-1",
		type: "payroll_ready",
		typeLabel: NOTIFICATION_TYPE_LABELS.payroll_ready,
		description: "Notify when payroll is ready for calculation",
		category: "payroll",
		enabled: true,
		isCritical: false,
		recipients: ["admins"],
		channels: ["email", "in_app"],
		timing: "immediate",
	},
	{
		id: "ns-2",
		type: "payroll_finalized",
		typeLabel: NOTIFICATION_TYPE_LABELS.payroll_finalized,
		description: "Notify when payroll has been finalized",
		category: "payroll",
		enabled: true,
		isCritical: true,
		recipients: ["admins", "managers"],
		channels: ["email", "in_app"],
		timing: "immediate",
	},
	{
		id: "ns-3",
		type: "payslip_released",
		typeLabel: NOTIFICATION_TYPE_LABELS.payslip_released,
		description: "Notify employees when their payslip is available",
		category: "payroll",
		enabled: true,
		isCritical: false,
		recipients: ["employees"],
		channels: ["email", "in_app"],
		timing: "immediate",
	},
	{
		id: "ns-4",
		type: "leave_submitted",
		typeLabel: NOTIFICATION_TYPE_LABELS.leave_submitted,
		description: "Notify managers when leave is requested",
		category: "leave",
		enabled: true,
		isCritical: false,
		recipients: ["managers"],
		channels: ["email", "in_app"],
		timing: "immediate",
	},
	{
		id: "ns-5",
		type: "leave_approved",
		typeLabel: NOTIFICATION_TYPE_LABELS.leave_approved,
		description: "Notify employees when leave is approved",
		category: "leave",
		enabled: true,
		isCritical: false,
		recipients: ["employees"],
		channels: ["email", "in_app"],
		timing: "immediate",
	},
	{
		id: "ns-6",
		type: "leave_rejected",
		typeLabel: NOTIFICATION_TYPE_LABELS.leave_rejected,
		description: "Notify employees when leave is rejected",
		category: "leave",
		enabled: true,
		isCritical: false,
		recipients: ["employees"],
		channels: ["email", "in_app"],
		timing: "immediate",
	},
	{
		id: "ns-7",
		type: "filing_due",
		typeLabel: NOTIFICATION_TYPE_LABELS.filing_due,
		description: "Remind admins about upcoming filing deadlines",
		category: "filings",
		enabled: true,
		isCritical: true,
		recipients: ["admins"],
		channels: ["email", "in_app"],
		timing: "scheduled",
		scheduleTime: "5 days before",
	},
	{
		id: "ns-8",
		type: "filing_rejected",
		typeLabel: NOTIFICATION_TYPE_LABELS.filing_rejected,
		description: "Alert when a filing is rejected by SARS",
		category: "filings",
		enabled: true,
		isCritical: true,
		recipients: ["admins"],
		channels: ["email", "in_app"],
		timing: "immediate",
	},
	{
		id: "ns-9",
		type: "termination_completed",
		typeLabel: NOTIFICATION_TYPE_LABELS.termination_completed,
		description: "Notify when employee termination is processed",
		category: "general",
		enabled: true,
		isCritical: false,
		recipients: ["admins", "managers"],
		channels: ["email"],
		timing: "immediate",
	},
	{
		id: "ns-10",
		type: "profile_change_submitted",
		typeLabel: NOTIFICATION_TYPE_LABELS.profile_change_submitted,
		description: "Notify admins of pending profile change requests",
		category: "general",
		enabled: true,
		isCritical: false,
		recipients: ["admins"],
		channels: ["in_app"],
		timing: "immediate",
	},
];

const userPreferences: UserNotificationPreference[] = [
	{ category: "payroll", categoryLabel: "Payroll", emailEnabled: true, inAppEnabled: true },
	{ category: "leave", categoryLabel: "Leave", emailEnabled: true, inAppEnabled: true },
	{ category: "general", categoryLabel: "General", emailEnabled: false, inAppEnabled: true },
];

const generateNotificationLogs = (): NotificationLog[] => {
	const types: NotificationType[] = [
		"payroll_finalized",
		"payslip_released",
		"leave_approved",
		"leave_submitted",
		"filing_due",
	];
	const channels: NotificationChannel[] = ["email", "in_app"];
	const statuses: NotificationStatus[] = ["sent", "sent", "sent", "read", "failed", "pending"];

	return Array.from({ length: 50 }, (_, i) => {
		const type = types[i % types.length];
		const status = statuses[i % statuses.length];
		const channel = channels[i % channels.length];

		return {
			id: `log-${i + 1}`,
			type,
			typeLabel: NOTIFICATION_TYPE_LABELS[type],
			recipientId: `user-${(i % 5) + 1}`,
			recipientName: faker.person.fullName(),
			recipientEmail: faker.internet.email(),
			channel,
			status,
			subject: `${NOTIFICATION_TYPE_LABELS[type]} - ${faker.company.name()}`,
			sentAt: new Date(Date.now() - i * 3600000 * 2).toISOString(),
			errorMessage: status === "failed" ? "SMTP connection timeout" : undefined,
		};
	});
};

const notificationLogs = generateNotificationLogs();

const automationRules: AutomationRule[] = [
	{
		id: "auto-1",
		name: "Notify Employees on Payslip Release",
		description: "Send email and in-app notification when payslips are released",
		trigger: "payslip_released",
		triggerLabel: TRIGGER_LABELS.payslip_released,
		conditions: [],
		action: "send_notification",
		actionLabel: ACTION_LABELS.send_notification,
		actionConfig: { channels: ["email", "in_app"], recipients: "employees" },
		status: "active",
		lastTriggeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
		triggerCount: 156,
		createdAt: "2024-01-15T00:00:00Z",
		updatedAt: "2025-01-10T00:00:00Z",
	},
	{
		id: "auto-2",
		name: "EMP201 Filing Reminder",
		description: "Remind payroll admins 5 days before EMP201 due date",
		trigger: "schedule",
		triggerLabel: TRIGGER_LABELS.schedule,
		conditions: [{ field: "role", operator: "equals", value: "payroll_admin" }],
		action: "send_reminder",
		actionLabel: ACTION_LABELS.send_reminder,
		actionConfig: { daysBefore: 5, filingType: "EMP201" },
		status: "active",
		lastTriggeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
		triggerCount: 24,
		createdAt: "2024-02-01T00:00:00Z",
		updatedAt: "2024-12-15T00:00:00Z",
	},
	{
		id: "auto-3",
		name: "Auto-Lock Finalized Payroll",
		description: "Automatically lock payroll after finalization",
		trigger: "payroll_finalized",
		triggerLabel: TRIGGER_LABELS.payroll_finalized,
		conditions: [],
		action: "change_status",
		actionLabel: ACTION_LABELS.change_status,
		actionConfig: { newStatus: "locked" },
		status: "active",
		lastTriggeredAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
		triggerCount: 89,
		createdAt: "2024-01-20T00:00:00Z",
		updatedAt: "2024-11-01T00:00:00Z",
	},
	{
		id: "auto-4",
		name: "Leave Approval Notification",
		description: "Notify employee when their leave request is approved",
		trigger: "leave_approved",
		triggerLabel: TRIGGER_LABELS.leave_approved,
		conditions: [],
		action: "send_notification",
		actionLabel: ACTION_LABELS.send_notification,
		actionConfig: { channels: ["email", "in_app"] },
		status: "active",
		lastTriggeredAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
		triggerCount: 234,
		createdAt: "2024-03-01T00:00:00Z",
		updatedAt: "2024-10-20T00:00:00Z",
	},
	{
		id: "auto-5",
		name: "Payroll Reminder Before Pay Date",
		description: "Remind admins 2 days before scheduled pay date",
		trigger: "schedule",
		triggerLabel: TRIGGER_LABELS.schedule,
		conditions: [],
		action: "send_reminder",
		actionLabel: ACTION_LABELS.send_reminder,
		actionConfig: { daysBefore: 2 },
		status: "paused",
		triggerCount: 12,
		createdAt: "2024-04-15T00:00:00Z",
		updatedAt: "2024-09-01T00:00:00Z",
	},
];

export const notificationHandlers = [
	// Overview
	http.get("/api/notifications/overview", async () => {
		await delay(200);
		const sentThisPeriod = notificationLogs.filter((l) => l.status === "sent" || l.status === "read").length;
		const failedCount = notificationLogs.filter((l) => l.status === "failed").length;
		const pendingCount = notificationLogs.filter((l) => l.status === "pending").length;
		const activeAutomations = automationRules.filter((r) => r.status === "active").length;

		const overview: NotificationOverview = {
			sentThisPeriod,
			failedCount,
			activeAutomations,
			pendingCount,
		};

		return HttpResponse.json({ status: "success", data: overview });
	}),

	// Notification Logs
	http.get("/api/notifications/logs", async ({ request }) => {
		await delay(200);
		const url = new URL(request.url);
		const status = url.searchParams.get("status");
		const channel = url.searchParams.get("channel");
		const limit = parseInt(url.searchParams.get("limit") || "50", 10);

		let filtered = [...notificationLogs];

		if (status) {
			filtered = filtered.filter((l) => l.status === status);
		}
		if (channel) {
			filtered = filtered.filter((l) => l.channel === channel);
		}

		return HttpResponse.json({ status: "success", data: filtered.slice(0, limit) });
	}),

	// Notification Settings
	http.get("/api/notifications/settings", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: notificationSettings });
	}),

	http.put("/api/notifications/settings", async ({ request }) => {
		await delay(300);
		const body = (await request.json()) as { settings: NotificationSetting[] };

		body.settings.forEach((updated) => {
			const index = notificationSettings.findIndex((s) => s.id === updated.id);
			if (index !== -1 && !notificationSettings[index].isCritical) {
				notificationSettings[index] = { ...notificationSettings[index], ...updated };
			}
		});

		return HttpResponse.json({ status: "success", data: notificationSettings });
	}),

	// User Preferences
	http.get("/api/notifications/preferences", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: userPreferences });
	}),

	http.put("/api/notifications/preferences", async ({ request }) => {
		await delay(300);
		const body = (await request.json()) as { preferences: UserNotificationPreference[] };

		body.preferences.forEach((updated) => {
			const index = userPreferences.findIndex((p) => p.category === updated.category);
			if (index !== -1) {
				userPreferences[index] = updated;
			}
		});

		return HttpResponse.json({ status: "success", data: userPreferences });
	}),

	// Automation Rules
	http.get("/api/automation/rules", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: automationRules });
	}),

	http.get("/api/automation/rules/:id", async ({ params }) => {
		await delay(200);
		const rule = automationRules.find((r) => r.id === params.id);
		if (!rule) {
			return HttpResponse.json({ status: "error", message: "Rule not found" }, { status: 404 });
		}
		return HttpResponse.json({ status: "success", data: rule });
	}),

	http.post("/api/automation/rules", async ({ request }) => {
		await delay(300);
		const body = (await request.json()) as {
			name: string;
			description: string;
			trigger: AutomationRule["trigger"];
			conditions: AutomationRule["conditions"];
			action: AutomationRule["action"];
			actionConfig: AutomationRule["actionConfig"];
		};

		const newRule: AutomationRule = {
			id: `auto-${automationRules.length + 1}`,
			name: body.name,
			description: body.description,
			trigger: body.trigger,
			triggerLabel: TRIGGER_LABELS[body.trigger],
			conditions: body.conditions,
			action: body.action,
			actionLabel: ACTION_LABELS[body.action],
			actionConfig: body.actionConfig,
			status: "draft",
			triggerCount: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		automationRules.push(newRule);
		return HttpResponse.json({ status: "success", data: newRule });
	}),

	http.put("/api/automation/rules/:id", async ({ params, request }) => {
		await delay(300);
		const body = (await request.json()) as Partial<AutomationRule>;
		const index = automationRules.findIndex((r) => r.id === params.id);

		if (index === -1) {
			return HttpResponse.json({ status: "error", message: "Rule not found" }, { status: 404 });
		}

		automationRules[index] = {
			...automationRules[index],
			...body,
			triggerLabel: body.trigger ? TRIGGER_LABELS[body.trigger] : automationRules[index].triggerLabel,
			actionLabel: body.action ? ACTION_LABELS[body.action] : automationRules[index].actionLabel,
			updatedAt: new Date().toISOString(),
		};

		return HttpResponse.json({ status: "success", data: automationRules[index] });
	}),

	http.post("/api/automation/rules/:id/test", async ({ params }) => {
		await delay(500);
		const rule = automationRules.find((r) => r.id === params.id);
		if (!rule) {
			return HttpResponse.json({ status: "error", message: "Rule not found" }, { status: 404 });
		}
		return HttpResponse.json({ status: "success", message: "Test completed successfully" });
	}),
];

export type HelpCategorySlug =
	| "getting_started"
	| "payroll"
	| "employees"
	| "leave"
	| "compliance"
	| "settings"
	| "troubleshooting";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type SystemStatus = "operational" | "degraded" | "outage" | "maintenance";

export interface HelpArticle {
	id: string;
	title: string;
	slug: string;
	category: HelpCategorySlug;
	categoryLabel: string;
	excerpt: string;
	content: string;
	isPopular: boolean;
	viewCount: number;
	updatedAt: string;
}

export interface HelpCategory {
	id: string;
	name: string;
	slug: HelpCategorySlug;
	description: string;
	articleCount: number;
	icon: string;
}

export interface SupportTicket {
	id: string;
	subject: string;
	category: string;
	description: string;
	priority: TicketPriority;
	status: TicketStatus;
	createdAt: string;
	updatedAt: string;
	attachments?: string[];
}

export interface CreateTicketInput {
	category: string;
	subject: string;
	description: string;
	priority: TicketPriority;
	attachmentUrl?: string;
}

export interface OnboardingStep {
	id: string;
	title: string;
	description: string;
	isCompleted: boolean;
	route?: string;
	order: number;
}

export interface OnboardingProgress {
	completedSteps: number;
	totalSteps: number;
	percentComplete: number;
	steps: OnboardingStep[];
	isDismissed: boolean;
}

export interface SystemStatusInfo {
	status: SystemStatus;
	message: string;
	updatedAt: string;
	incidents?: Array<{
		id: string;
		title: string;
		status: string;
		createdAt: string;
	}>;
	maintenanceScheduled?: {
		startTime: string;
		endTime: string;
		description: string;
	};
}

export interface HelpSearchResult {
	articles: HelpArticle[];
	totalCount: number;
}

export const CATEGORY_LABELS: Record<string, string> = {
	getting_started: "Getting Started",
	payroll: "Payroll",
	employees: "Employees",
	leave: "Leave Management",
	compliance: "Compliance & Filings",
	settings: "Settings",
	troubleshooting: "Troubleshooting",
};

export const CATEGORY_ICONS: Record<string, string> = {
	getting_started: "rocket",
	payroll: "dollar-sign",
	employees: "users",
	leave: "calendar",
	compliance: "shield",
	settings: "settings",
	troubleshooting: "help-circle",
};

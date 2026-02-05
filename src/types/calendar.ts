export type HolidayType = "public" | "company" | "custom";

export type HolidayStatus = "default" | "overridden" | "custom";

export type PayDateAdjustment = "earlier" | "later" | "none";

export type HolidayPayRule = "paid" | "unpaid" | "paid_if_scheduled" | "premium";

export interface PublicHoliday {
	id: string;
	name: string;
	date: string;
	observedDate?: string;
	type: HolidayType;
	status: HolidayStatus;
	isPaid: boolean;
	isSystemHoliday: boolean;
	payRule: HolidayPayRule;
	overtimeMultiplier?: number;
	scope: "all" | "pay_point";
	payPointIds?: string[];
	year: number;
}

export interface CompanyHoliday {
	id: string;
	name: string;
	date: string;
	isPaid: boolean;
	scope: "all" | "pay_point";
	payPointIds?: string[];
	createdAt: string;
}

export interface CalendarEvent {
	id: string;
	date: string;
	type: "holiday" | "payroll_cutoff" | "pay_date" | "filing_due" | "leave";
	title: string;
	description?: string;
	color: string;
}

export interface CalendarOverview {
	currentMonth: string;
	events: CalendarEvent[];
	upcomingHolidays: PublicHoliday[];
	nextPayDate?: string;
	nextCutoffDate?: string;
}

export interface WorkingDaySettings {
	monday: boolean;
	tuesday: boolean;
	wednesday: boolean;
	thursday: boolean;
	friday: boolean;
	saturday: boolean;
	sunday: boolean;
	hoursPerDay: number;
	halfDayHours: number;
}

export interface PayFrequencySettings {
	frequency: "monthly" | "weekly" | "fortnightly";
	payDay: number;
	cutoffDaysBefore: number;
	adjustmentRule: PayDateAdjustment;
}

export interface HolidayPaySettings {
	defaultPayRule: HolidayPayRule;
	paidOnlyIfScheduled: boolean;
	overtimeMultiplier: number;
	premiumRate: number;
}

export interface CalendarSettings {
	workingDays: WorkingDaySettings;
	payFrequency: PayFrequencySettings;
	holidayPay: HolidayPaySettings;
}

export interface CreateCompanyHolidayInput {
	name: string;
	date: string;
	isPaid: boolean;
	scope: "all" | "pay_point";
	payPointIds?: string[];
}

export interface UpdateHolidayOverrideInput {
	isPaid?: boolean;
	payRule?: HolidayPayRule;
	overtimeMultiplier?: number;
	scope?: "all" | "pay_point";
	payPointIds?: string[];
}

export const WEEKDAY_LABELS: Record<string, string> = {
	monday: "Monday",
	tuesday: "Tuesday",
	wednesday: "Wednesday",
	thursday: "Thursday",
	friday: "Friday",
	saturday: "Saturday",
	sunday: "Sunday",
};

export const PAY_RULE_LABELS: Record<HolidayPayRule, string> = {
	paid: "Paid",
	unpaid: "Unpaid",
	paid_if_scheduled: "Paid if Scheduled",
	premium: "Premium Rate",
};

export const SOUTH_AFRICAN_HOLIDAYS_2025 = [
	{ name: "New Year's Day", date: "2025-01-01" },
	{ name: "Human Rights Day", date: "2025-03-21" },
	{ name: "Good Friday", date: "2025-04-18" },
	{ name: "Family Day", date: "2025-04-21" },
	{ name: "Freedom Day", date: "2025-04-27" },
	{ name: "Workers' Day", date: "2025-05-01" },
	{ name: "Youth Day", date: "2025-06-16" },
	{ name: "National Women's Day", date: "2025-08-09" },
	{ name: "Heritage Day", date: "2025-09-24" },
	{ name: "Day of Reconciliation", date: "2025-12-16" },
	{ name: "Christmas Day", date: "2025-12-25" },
	{ name: "Day of Goodwill", date: "2025-12-26" },
];

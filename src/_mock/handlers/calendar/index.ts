import { http, HttpResponse, delay } from "msw";
import type {
	PublicHoliday,
	CalendarEvent,
	CalendarOverview,
	CalendarSettings,
	WorkingDaySettings,
	PayFrequencySettings,
	HolidayPaySettings,
} from "@/types/calendar";
import { SOUTH_AFRICAN_HOLIDAYS_2025 } from "@/types/calendar";

const generatePublicHolidays = (year: number): PublicHoliday[] => {
	const baseHolidays =
		year === 2025
			? SOUTH_AFRICAN_HOLIDAYS_2025
			: [
					{ name: "New Year's Day", date: `${year}-01-01` },
					{ name: "Human Rights Day", date: `${year}-03-21` },
					{ name: "Good Friday", date: `${year}-04-18` },
					{ name: "Family Day", date: `${year}-04-21` },
					{ name: "Freedom Day", date: `${year}-04-27` },
					{ name: "Workers' Day", date: `${year}-05-01` },
					{ name: "Youth Day", date: `${year}-06-16` },
					{ name: "National Women's Day", date: `${year}-08-09` },
					{ name: "Heritage Day", date: `${year}-09-24` },
					{ name: "Day of Reconciliation", date: `${year}-12-16` },
					{ name: "Christmas Day", date: `${year}-12-25` },
					{ name: "Day of Goodwill", date: `${year}-12-26` },
				];

	return baseHolidays.map((h, i) => ({
		id: `holiday-${year}-${i + 1}`,
		name: h.name,
		date: h.date,
		type: "public" as const,
		status: "default" as const,
		isPaid: true,
		isSystemHoliday: true,
		payRule: "paid" as const,
		overtimeMultiplier: 2,
		scope: "all" as const,
		year,
	}));
};

const companyHolidays: PublicHoliday[] = [
	{
		id: "company-1",
		name: "Company Anniversary",
		date: "2025-06-15",
		type: "company",
		status: "custom",
		isPaid: true,
		isSystemHoliday: false,
		payRule: "paid",
		scope: "all",
		year: 2025,
	},
];

let calendarSettings: CalendarSettings = {
	workingDays: {
		monday: true,
		tuesday: true,
		wednesday: true,
		thursday: true,
		friday: true,
		saturday: false,
		sunday: false,
		hoursPerDay: 8,
		halfDayHours: 4,
	},
	payFrequency: {
		frequency: "monthly",
		payDay: 25,
		cutoffDaysBefore: 5,
		adjustmentRule: "earlier",
	},
	holidayPay: {
		defaultPayRule: "paid",
		paidOnlyIfScheduled: false,
		overtimeMultiplier: 2,
		premiumRate: 1.5,
	},
};

const generateCalendarEvents = (year: number, month: number): CalendarEvent[] => {
	const events: CalendarEvent[] = [];
	const holidays = generatePublicHolidays(year);

	holidays.forEach((h) => {
		const holidayDate = new Date(h.date);
		if (holidayDate.getMonth() + 1 === month) {
			events.push({
				id: `event-${h.id}`,
				date: h.date,
				type: "holiday",
				title: h.name,
				description: h.isPaid ? "Paid public holiday" : "Unpaid public holiday",
				color: "#ef4444",
			});
		}
	});

	const payDay = calendarSettings.payFrequency.payDay;
	const cutoffDay = payDay - calendarSettings.payFrequency.cutoffDaysBefore;

	events.push({
		id: `paydate-${year}-${month}`,
		date: `${year}-${String(month).padStart(2, "0")}-${String(payDay).padStart(2, "0")}`,
		type: "pay_date",
		title: "Pay Date",
		description: "Monthly salary payment",
		color: "#22c55e",
	});

	if (cutoffDay > 0) {
		events.push({
			id: `cutoff-${year}-${month}`,
			date: `${year}-${String(month).padStart(2, "0")}-${String(cutoffDay).padStart(2, "0")}`,
			type: "payroll_cutoff",
			title: "Payroll Cutoff",
			description: "Last day for payroll changes",
			color: "#f59e0b",
		});
	}

	return events;
};

export const calendarHandlers = [
	// Calendar Overview
	http.get("/api/calendar/overview", async ({ request }) => {
		await delay(200);
		const url = new URL(request.url);
		const year = parseInt(url.searchParams.get("year") || String(new Date().getFullYear()), 10);
		const month = parseInt(url.searchParams.get("month") || String(new Date().getMonth() + 1), 10);

		const events = generateCalendarEvents(year, month);
		const holidays = generatePublicHolidays(year);
		const today = new Date();
		const upcomingHolidays = holidays.filter((h) => new Date(h.date) >= today).slice(0, 5);

		const payDay = calendarSettings.payFrequency.payDay;
		const cutoffDay = payDay - calendarSettings.payFrequency.cutoffDaysBefore;
		const nextPayDate = `${year}-${String(month).padStart(2, "0")}-${String(payDay).padStart(2, "0")}`;
		const nextCutoffDate = `${year}-${String(month).padStart(2, "0")}-${String(cutoffDay).padStart(2, "0")}`;

		const overview: CalendarOverview = {
			currentMonth: `${year}-${String(month).padStart(2, "0")}`,
			events,
			upcomingHolidays,
			nextPayDate,
			nextCutoffDate,
		};

		return HttpResponse.json({ status: "success", data: overview });
	}),

	// Get Holidays
	http.get("/api/calendar/holidays", async ({ request }) => {
		await delay(200);
		const url = new URL(request.url);
		const year = parseInt(url.searchParams.get("year") || String(new Date().getFullYear()), 10);

		const publicHolidays = generatePublicHolidays(year);
		const yearCompanyHolidays = companyHolidays.filter((h) => h.year === year);
		const allHolidays = [...publicHolidays, ...yearCompanyHolidays];

		return HttpResponse.json({ status: "success", data: allHolidays });
	}),

	// Update Holiday
	http.put("/api/calendar/holidays/:id", async ({ params, request }) => {
		await delay(200);
		const body = (await request.json()) as { isPaid?: boolean };
		return HttpResponse.json({
			status: "success",
			data: { id: params.id, ...body },
		});
	}),

	// Add Company Holiday
	http.post("/api/calendar/holidays/company", async ({ request }) => {
		await delay(300);
		const body = (await request.json()) as {
			name: string;
			date: string;
			isPaid: boolean;
			scope: "all" | "pay_point";
		};

		const newHoliday: PublicHoliday = {
			id: `company-${Date.now()}`,
			name: body.name,
			date: body.date,
			type: "company",
			status: "custom",
			isPaid: body.isPaid,
			isSystemHoliday: false,
			payRule: body.isPaid ? "paid" : "unpaid",
			scope: body.scope,
			year: new Date(body.date).getFullYear(),
		};

		companyHolidays.push(newHoliday);
		return HttpResponse.json({ status: "success", data: newHoliday });
	}),

	// Get Calendar Settings
	http.get("/api/calendar/settings", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: calendarSettings });
	}),

	// Update Calendar Settings
	http.put("/api/calendar/settings", async ({ request }) => {
		await delay(300);
		const body = (await request.json()) as {
			workingDays?: WorkingDaySettings;
			payFrequency?: PayFrequencySettings;
			holidayPay?: HolidayPaySettings;
		};

		if (body.workingDays) {
			calendarSettings.workingDays = body.workingDays;
		}
		if (body.payFrequency) {
			calendarSettings.payFrequency = body.payFrequency;
		}
		if (body.holidayPay) {
			calendarSettings.holidayPay = body.holidayPay;
		}

		return HttpResponse.json({ status: "success", data: calendarSettings });
	}),
];

import { faker } from "@faker-js/faker";
import { http, HttpResponse, delay } from "msw";
import type { LeaveType, LeaveBalance, LeaveRequest, LeaveOverview, LeaveCalendarEvent } from "@/types/leave";

const leaveTypes: LeaveType[] = [
	{
		id: "lt-1",
		name: "Annual Leave",
		code: "ANNUAL",
		accrualMethod: "monthly",
		accrualRate: 1.25,
		cycleStartMonth: 1,
		carryOverLimit: 5,
		carryOverExpireMonths: 6,
		allowNegativeBalance: false,
		requiresAttachment: false,
		isPaid: true,
		isActive: true,
	},
	{
		id: "lt-2",
		name: "Sick Leave",
		code: "SICK",
		accrualMethod: "annual",
		accrualRate: 30,
		cycleStartMonth: 1,
		carryOverLimit: null,
		carryOverExpireMonths: null,
		allowNegativeBalance: false,
		requiresAttachment: true,
		isPaid: true,
		isActive: true,
	},
	{
		id: "lt-3",
		name: "Family Responsibility",
		code: "FAMILY",
		accrualMethod: "annual",
		accrualRate: 3,
		cycleStartMonth: 1,
		carryOverLimit: 0,
		carryOverExpireMonths: null,
		allowNegativeBalance: false,
		requiresAttachment: false,
		isPaid: true,
		isActive: true,
	},
	{
		id: "lt-4",
		name: "Unpaid Leave",
		code: "UNPAID",
		accrualMethod: "none",
		accrualRate: 0,
		cycleStartMonth: 1,
		carryOverLimit: null,
		carryOverExpireMonths: null,
		allowNegativeBalance: true,
		requiresAttachment: false,
		isPaid: false,
		isActive: true,
	},
	{
		id: "lt-5",
		name: "Study Leave",
		code: "STUDY",
		accrualMethod: "annual",
		accrualRate: 5,
		cycleStartMonth: 1,
		carryOverLimit: 0,
		carryOverExpireMonths: null,
		allowNegativeBalance: false,
		requiresAttachment: true,
		isPaid: true,
		isActive: true,
	},
];

const generateBalances = (): LeaveBalance[] => {
	const balances: LeaveBalance[] = [];
	for (let i = 1; i <= 25; i++) {
		const name = faker.person.fullName();
		for (const lt of leaveTypes.filter((l) => l.accrualMethod !== "none")) {
			const accrued = lt.accrualMethod === "monthly" ? lt.accrualRate * 12 : lt.accrualRate;
			const taken = faker.number.int({ min: 0, max: Math.floor(accrued * 0.7) });
			const pending = faker.number.int({ min: 0, max: 2 });
			const available = accrued - taken - pending;
			balances.push({
				id: `bal-${i}-${lt.id}`,
				employeeId: `emp-${i}`,
				employeeName: name,
				employeeNumber: `EMP${1000 + i}`,
				leaveTypeId: lt.id,
				leaveTypeName: lt.name,
				accrued,
				taken,
				pending,
				available,
				isNegative: available < 0,
			});
		}
	}
	return balances;
};

const generateRequests = (): LeaveRequest[] => {
	const statuses: Array<"pending" | "approved" | "rejected" | "cancelled"> = [
		"pending",
		"approved",
		"approved",
		"approved",
		"rejected",
	];
	return Array.from({ length: 30 }, (_, i) => {
		const status = statuses[i % statuses.length];
		const lt = leaveTypes[i % leaveTypes.length];
		const startDate = faker.date.between({ from: "2026-01-01", to: "2026-03-31" });
		const days = faker.number.int({ min: 1, max: 5 });
		const endDate = new Date(startDate);
		endDate.setDate(endDate.getDate() + days - 1);
		return {
			id: `req-${i + 1}`,
			employeeId: `emp-${(i % 25) + 1}`,
			employeeName: faker.person.fullName(),
			employeeNumber: `EMP${1001 + (i % 25)}`,
			leaveTypeId: lt.id,
			leaveTypeName: lt.name,
			startDate: startDate.toISOString().split("T")[0],
			endDate: endDate.toISOString().split("T")[0],
			days,
			isPartialDay: false,
			status,
			reason: faker.lorem.sentence(),
			approvedBy: status === "approved" ? "Admin User" : undefined,
			approvedAt: status === "approved" ? faker.date.recent().toISOString() : undefined,
			rejectedBy: status === "rejected" ? "Admin User" : undefined,
			rejectedAt: status === "rejected" ? faker.date.recent().toISOString() : undefined,
			rejectionReason: status === "rejected" ? "Insufficient notice period" : undefined,
			createdAt: faker.date.recent({ days: 14 }).toISOString(),
		};
	});
};

let mockBalances = generateBalances();
let mockRequests = generateRequests();

export const leaveHandlers = [
	http.get("/api/leave/overview", async () => {
		await delay(300);
		const pendingRequests = mockRequests.filter((r) => r.status === "pending");
		const approvedUpcoming = mockRequests
			.filter((r) => r.status === "approved" && new Date(r.startDate) >= new Date())
			.slice(0, 5);
		const overview: LeaveOverview = {
			employeesOnLeave: 3,
			pendingApprovals: pendingRequests.length,
			negativeBalances: mockBalances.filter((b) => b.isNegative).length,
			expiringBalances: 5,
			upcomingLeave: approvedUpcoming.map((r) => ({
				id: r.id,
				employeeName: r.employeeName,
				leaveTypeName: r.leaveTypeName,
				startDate: r.startDate,
				endDate: r.endDate,
				days: r.days,
			})),
		};
		return HttpResponse.json({ status: "success", data: overview });
	}),

	http.get("/api/leave/types", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: leaveTypes });
	}),

	http.post("/api/leave/types", async ({ request }) => {
		await delay(300);
		const body = (await request.json()) as Partial<LeaveType>;
		const newType: LeaveType = {
			id: `lt-${leaveTypes.length + 1}`,
			name: body.name || "New Leave Type",
			code: body.code || "NEW",
			accrualMethod: body.accrualMethod || "none",
			accrualRate: body.accrualRate || 0,
			cycleStartMonth: body.cycleStartMonth || 1,
			carryOverLimit: body.carryOverLimit ?? null,
			carryOverExpireMonths: body.carryOverExpireMonths ?? null,
			allowNegativeBalance: body.allowNegativeBalance || false,
			requiresAttachment: body.requiresAttachment || false,
			isPaid: body.isPaid ?? true,
			isActive: true,
		};
		leaveTypes.push(newType);
		return HttpResponse.json({ status: "success", data: newType });
	}),

	http.put("/api/leave/types/:id", async ({ params, request }) => {
		await delay(300);
		const body = (await request.json()) as Partial<LeaveType>;
		const index = leaveTypes.findIndex((t) => t.id === params.id);
		if (index !== -1) {
			leaveTypes[index] = { ...leaveTypes[index], ...body };
			return HttpResponse.json({ status: "success", data: leaveTypes[index] });
		}
		return HttpResponse.json({ status: "error", message: "Leave type not found" }, { status: 404 });
	}),

	http.get("/api/leave/balances", async ({ request }) => {
		await delay(300);
		const url = new URL(request.url);
		const employeeId = url.searchParams.get("employeeId");
		const leaveTypeId = url.searchParams.get("leaveTypeId");
		const negativeOnly = url.searchParams.get("negativeOnly") === "true";

		let filtered = [...mockBalances];
		if (employeeId) filtered = filtered.filter((b) => b.employeeId === employeeId);
		if (leaveTypeId) filtered = filtered.filter((b) => b.leaveTypeId === leaveTypeId);
		if (negativeOnly) filtered = filtered.filter((b) => b.isNegative);

		return HttpResponse.json({ status: "success", data: filtered });
	}),

	http.put("/api/leave/balances/:employeeId", async ({ params, request }) => {
		await delay(300);
		const body = (await request.json()) as { leaveTypeId: string; amount: number; reason: string };
		const balance = mockBalances.find((b) => b.employeeId === params.employeeId && b.leaveTypeId === body.leaveTypeId);
		if (balance) {
			balance.accrued += body.amount;
			balance.available += body.amount;
			balance.isNegative = balance.available < 0;
			return HttpResponse.json({ status: "success", data: balance });
		}
		return HttpResponse.json({ status: "error", message: "Balance not found" }, { status: 404 });
	}),

	http.get("/api/leave/requests", async ({ request }) => {
		await delay(300);
		const url = new URL(request.url);
		const status = url.searchParams.get("status");
		const leaveTypeId = url.searchParams.get("leaveTypeId");

		let filtered = [...mockRequests];
		if (status && status !== "all") filtered = filtered.filter((r) => r.status === status);
		if (leaveTypeId) filtered = filtered.filter((r) => r.leaveTypeId === leaveTypeId);

		return HttpResponse.json({ status: "success", data: filtered });
	}),

	http.get("/api/leave/requests/:id", async ({ params }) => {
		await delay(200);
		const request = mockRequests.find((r) => r.id === params.id);
		if (!request) {
			return HttpResponse.json({ status: "error", message: "Request not found" }, { status: 404 });
		}
		return HttpResponse.json({ status: "success", data: request });
	}),

	http.post("/api/leave/requests", async ({ request }) => {
		await delay(400);
		const body = (await request.json()) as Record<string, unknown>;
		const lt = leaveTypes.find((t) => t.id === body.leaveTypeId);
		const newRequest: LeaveRequest = {
			id: `req-${mockRequests.length + 1}`,
			employeeId: "emp-1",
			employeeName: "Current User",
			employeeNumber: "EMP1001",
			leaveTypeId: body.leaveTypeId as string,
			leaveTypeName: lt?.name || "Leave",
			startDate: body.startDate as string,
			endDate: body.endDate as string,
			days: (body.days as number) || 1,
			isPartialDay: (body.isPartialDay as boolean) || false,
			partialHours: body.partialHours as number,
			status: "pending",
			reason: body.reason as string,
			createdAt: new Date().toISOString(),
		};
		mockRequests.unshift(newRequest);
		return HttpResponse.json({ status: "success", data: newRequest });
	}),

	http.put("/api/leave/requests/:id/approve", async ({ params }) => {
		await delay(300);
		const request = mockRequests.find((r) => r.id === params.id);
		if (!request) {
			return HttpResponse.json({ status: "error", message: "Request not found" }, { status: 404 });
		}
		request.status = "approved";
		request.approvedBy = "Admin User";
		request.approvedAt = new Date().toISOString();
		return HttpResponse.json({ status: "success", data: request });
	}),

	http.put("/api/leave/requests/:id/reject", async ({ params, request }) => {
		await delay(300);
		const body = (await request.json()) as { reason: string };
		const req = mockRequests.find((r) => r.id === params.id);
		if (!req) {
			return HttpResponse.json({ status: "error", message: "Request not found" }, { status: 404 });
		}
		req.status = "rejected";
		req.rejectedBy = "Admin User";
		req.rejectedAt = new Date().toISOString();
		req.rejectionReason = body.reason;
		return HttpResponse.json({ status: "success", data: req });
	}),

	http.put("/api/leave/requests/:id/cancel", async ({ params }) => {
		await delay(300);
		const request = mockRequests.find((r) => r.id === params.id);
		if (!request) {
			return HttpResponse.json({ status: "error", message: "Request not found" }, { status: 404 });
		}
		request.status = "cancelled";
		return HttpResponse.json({ status: "success", data: request });
	}),

	http.get("/api/leave/calendar", async ({ request }) => {
		await delay(300);
		const url = new URL(request.url);
		const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);

		const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
		const events: LeaveCalendarEvent[] = mockRequests
			.filter((r) => r.status === "approved" && r.startDate.startsWith(month.slice(0, 7)))
			.map((r, i) => ({
				id: r.id,
				employeeId: r.employeeId,
				employeeName: r.employeeName,
				leaveTypeId: r.leaveTypeId,
				leaveTypeName: r.leaveTypeName,
				startDate: r.startDate,
				endDate: r.endDate,
				days: r.days,
				color: colors[i % colors.length],
			}));

		return HttpResponse.json({ status: "success", data: events });
	}),

	http.get("/api/leave/my/balances", async () => {
		await delay(200);
		const myBalances = mockBalances.filter((b) => b.employeeId === "emp-1");
		return HttpResponse.json({ status: "success", data: myBalances });
	}),

	http.get("/api/leave/my/requests", async () => {
		await delay(200);
		const myRequests = mockRequests.filter((r) => r.employeeId === "emp-1");
		return HttpResponse.json({ status: "success", data: myRequests });
	}),
];

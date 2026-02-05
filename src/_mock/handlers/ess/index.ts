import { faker } from "@faker-js/faker";
import { delay, HttpResponse, http } from "msw";
import type {
	ESSDocument,
	ESSLeaveBalance,
	ESSLeaveRequest,
	ESSNotification,
	ESSOverview,
	ESSPayslip,
	ESSPayslipDetail,
	ESSProfile,
	ESSProfileChangeRequest,
} from "@/types/ess";

const generatePayslips = (): ESSPayslip[] => {
	const payslips: ESSPayslip[] = [];
	const now = new Date();

	for (let i = 0; i < 12; i++) {
		const payDate = new Date(now.getFullYear(), now.getMonth() - i, 25);
		const periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);

		const grossPay = faker.number.int({ min: 25000, max: 45000 });
		const deductions = Math.round(grossPay * 0.25);

		payslips.push({
			id: `payslip-${i + 1}`,
			payPeriod: `${periodStart.toLocaleDateString("en-ZA", { month: "short", year: "numeric" })}`,
			payDate: payDate.toISOString().split("T")[0],
			grossPay,
			netPay: grossPay - deductions,
			status: "finalized",
		});
	}

	return payslips;
};

const generatePayslipDetail = (id: string): ESSPayslipDetail => {
	const grossPay = faker.number.int({ min: 25000, max: 45000 });
	const paye = Math.round(grossPay * 0.18);
	const uif = Math.round(grossPay * 0.01);
	const pension = Math.round(grossPay * 0.075);
	const medical = 2500;
	const totalDeductions = paye + uif + pension + medical;

	return {
		id,
		payPeriod: "January 2026",
		payDate: "2026-01-25",
		employeeName: "John Smith",
		employeeNumber: "EMP001",
		employerName: "ABC Company (Pty) Ltd",
		employerAddress: "123 Main Street\nJohannesburg, 2000\nSouth Africa",
		earnings: [
			{ name: "Basic Salary", amount: grossPay - 5000, isRecurring: true },
			{ name: "Transport Allowance", amount: 3000, isRecurring: true },
			{ name: "Cell Phone Allowance", amount: 1500, isRecurring: true },
			{ name: "Performance Bonus", amount: 500, isRecurring: false },
		],
		deductions: [
			{ name: "PAYE", amount: paye, isStatutory: true },
			{ name: "UIF", amount: uif, isStatutory: true },
			{ name: "Pension Fund", amount: pension, isStatutory: false },
			{ name: "Medical Aid", amount: medical, isStatutory: false },
		],
		grossPay,
		totalDeductions,
		netPay: grossPay - totalDeductions,
		bankName: "First National Bank",
		accountNumber: "62********89",
		notes: "Thank you for your continued dedication.",
	};
};

const leaveBalances: ESSLeaveBalance[] = [
	{ leaveTypeId: "lt-1", leaveTypeName: "Annual Leave", accrued: 15, taken: 5, pending: 2, available: 8 },
	{ leaveTypeId: "lt-2", leaveTypeName: "Sick Leave", accrued: 30, taken: 3, pending: 0, available: 27 },
	{ leaveTypeId: "lt-3", leaveTypeName: "Family Responsibility", accrued: 3, taken: 1, pending: 0, available: 2 },
	{ leaveTypeId: "lt-4", leaveTypeName: "Study Leave", accrued: 5, taken: 0, pending: 0, available: 5 },
];

const leaveRequests: ESSLeaveRequest[] = [
	{
		id: "req-1",
		leaveTypeId: "lt-1",
		leaveTypeName: "Annual Leave",
		startDate: "2026-02-15",
		endDate: "2026-02-16",
		days: 2,
		status: "pending",
		reason: "Personal matters",
		createdAt: "2026-02-01T10:00:00Z",
	},
	{
		id: "req-2",
		leaveTypeId: "lt-1",
		leaveTypeName: "Annual Leave",
		startDate: "2026-01-10",
		endDate: "2026-01-12",
		days: 3,
		status: "approved",
		reason: "Family vacation",
		approvedBy: "Manager",
		approvedAt: "2026-01-05T14:00:00Z",
		createdAt: "2026-01-03T09:00:00Z",
	},
	{
		id: "req-3",
		leaveTypeId: "lt-2",
		leaveTypeName: "Sick Leave",
		startDate: "2025-12-20",
		endDate: "2025-12-22",
		days: 3,
		status: "approved",
		reason: "Medical appointment",
		approvedBy: "Manager",
		approvedAt: "2025-12-19T16:00:00Z",
		createdAt: "2025-12-18T08:00:00Z",
	},
	{
		id: "req-4",
		leaveTypeId: "lt-1",
		leaveTypeName: "Annual Leave",
		startDate: "2025-11-25",
		endDate: "2025-11-26",
		days: 2,
		status: "rejected",
		reason: "Personal trip",
		rejectedBy: "Manager",
		rejectedAt: "2025-11-20T10:00:00Z",
		rejectionReason: "Critical project deadline - please reschedule",
		createdAt: "2025-11-18T11:00:00Z",
	},
];

const profile: ESSProfile = {
	employeeId: "emp-1",
	employeeNumber: "EMP001",
	firstName: "John",
	lastName: "Smith",
	idNumber: "8501015800086",
	taxNumber: "1234567890",
	email: "john.smith@company.com",
	phone: "+27 82 123 4567",
	address: "45 Oak Avenue, Sandton, 2196",
	bankName: "First National Bank",
	accountNumber: "62345678901",
	branchCode: "250655",
	accountType: "Cheque",
	startDate: "2020-03-15",
	position: "Senior Developer",
	department: "Engineering",
};

const profileChangeRequests: ESSProfileChangeRequest[] = [
	{
		id: "pcr-1",
		field: "phone",
		currentValue: "+27 82 123 4567",
		requestedValue: "+27 83 987 6543",
		status: "pending",
		reason: "Changed phone number",
		createdAt: "2026-01-28T10:00:00Z",
	},
	{
		id: "pcr-2",
		field: "address",
		currentValue: "123 Old Street, Johannesburg",
		requestedValue: "45 Oak Avenue, Sandton, 2196",
		status: "approved",
		createdAt: "2025-12-15T09:00:00Z",
		processedAt: "2025-12-16T14:00:00Z",
		processedBy: "HR Admin",
	},
];

const notifications: ESSNotification[] = [
	{
		id: "notif-1",
		type: "payslip_released",
		title: "Payslip Available",
		message: "Your January 2026 payslip is now available for viewing.",
		isRead: false,
		createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
		relatedId: "payslip-1",
	},
	{
		id: "notif-2",
		type: "leave_approved",
		title: "Leave Request Approved",
		message: "Your annual leave request for Jan 10-12 has been approved.",
		isRead: false,
		createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
		relatedId: "req-2",
	},
	{
		id: "notif-3",
		type: "profile_change_approved",
		title: "Profile Update Approved",
		message: "Your address change request has been approved.",
		isRead: true,
		createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
		relatedId: "pcr-2",
	},
];

const documents: ESSDocument[] = [
	{
		id: "doc-1",
		name: "IRP5 Certificate 2025",
		type: "irp5",
		taxYear: "2025",
		description: "Annual tax certificate for 2025 tax year",
		downloadUrl: "/api/ess/documents/doc-1/download",
		releasedAt: "2026-01-15T10:00:00Z",
	},
	{
		id: "doc-2",
		name: "IRP5 Certificate 2024",
		type: "irp5",
		taxYear: "2024",
		description: "Annual tax certificate for 2024 tax year",
		downloadUrl: "/api/ess/documents/doc-2/download",
		releasedAt: "2025-01-20T10:00:00Z",
	},
	{
		id: "doc-3",
		name: "Employment Confirmation Letter",
		type: "employment_letter",
		description: "Official confirmation of employment",
		downloadUrl: "/api/ess/documents/doc-3/download",
		releasedAt: "2025-06-10T14:00:00Z",
	},
];

const mockPayslips = generatePayslips();

export const essHandlers = [
	// ESS Overview
	http.get("/api/ess/overview", async () => {
		await delay(300);
		const latestPayslip = mockPayslips[0];
		const pendingLeave = leaveRequests.filter(
			(r) => r.status === "pending" || (r.status === "approved" && new Date(r.startDate) > new Date()),
		);

		const overview: ESSOverview = {
			latestPayslip: latestPayslip
				? {
						id: latestPayslip.id,
						payPeriod: latestPayslip.payPeriod,
						payDate: latestPayslip.payDate,
						netPay: latestPayslip.netPay,
					}
				: null,
			leaveBalances: leaveBalances.map((b) => ({
				leaveTypeId: b.leaveTypeId,
				leaveTypeName: b.leaveTypeName,
				available: b.available,
			})),
			upcomingLeave: pendingLeave.slice(0, 3).map((l) => ({
				id: l.id,
				leaveTypeName: l.leaveTypeName,
				startDate: l.startDate,
				endDate: l.endDate,
				days: l.days,
				status: l.status,
			})),
		};

		return HttpResponse.json({ status: "success", data: overview });
	}),

	// Notifications
	http.get("/api/ess/notifications", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: notifications });
	}),

	http.put("/api/ess/notifications/:id/read", async ({ params }) => {
		await delay(100);
		const notif = notifications.find((n) => n.id === params.id);
		if (notif) {
			notif.isRead = true;
		}
		return HttpResponse.json({ status: "success" });
	}),

	http.put("/api/ess/notifications/read-all", async () => {
		await delay(100);
		notifications.forEach((n) => {
			n.isRead = true;
		});
		return HttpResponse.json({ status: "success" });
	}),

	// Payslips
	http.get("/api/ess/payslips", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: mockPayslips });
	}),

	http.get("/api/ess/payslips/:id", async ({ params }) => {
		await delay(200);
		const payslip = generatePayslipDetail(params.id as string);
		return HttpResponse.json({ status: "success", data: payslip });
	}),

	http.get("/api/ess/payslips/:id/download", async () => {
		await delay(100);
		return new HttpResponse("PDF content", {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": "attachment; filename=payslip.pdf",
			},
		});
	}),

	// Leave Balances
	http.get("/api/ess/leave/balances", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: leaveBalances });
	}),

	// Leave Requests
	http.get("/api/ess/leave/requests", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: leaveRequests });
	}),

	http.post("/api/ess/leave/requests", async ({ request }) => {
		await delay(400);
		const body = (await request.json()) as Record<string, unknown>;
		const leaveType = leaveBalances.find((b) => b.leaveTypeId === body.leaveTypeId);

		const newRequest: ESSLeaveRequest = {
			id: `req-${leaveRequests.length + 1}`,
			leaveTypeId: body.leaveTypeId as string,
			leaveTypeName: leaveType?.leaveTypeName || "Leave",
			startDate: body.startDate as string,
			endDate: body.endDate as string,
			days: (body.days as number) || 1,
			status: "pending",
			reason: body.reason as string,
			createdAt: new Date().toISOString(),
		};

		leaveRequests.unshift(newRequest);

		// Update pending balance
		if (leaveType) {
			leaveType.pending += newRequest.days;
			leaveType.available -= newRequest.days;
		}

		return HttpResponse.json({ status: "success", data: newRequest });
	}),

	// Profile
	http.get("/api/ess/profile", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: profile });
	}),

	http.get("/api/ess/profile/requests", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: profileChangeRequests });
	}),

	http.post("/api/ess/profile/requests", async ({ request }) => {
		await delay(400);
		const body = (await request.json()) as Record<string, unknown>;

		const newRequest: ESSProfileChangeRequest = {
			id: `pcr-${profileChangeRequests.length + 1}`,
			field: body.field as string,
			currentValue: body.currentValue as string,
			requestedValue: body.requestedValue as string,
			status: "pending",
			reason: body.reason as string,
			createdAt: new Date().toISOString(),
		};

		profileChangeRequests.unshift(newRequest);

		// Add notification
		notifications.unshift({
			id: `notif-${notifications.length + 1}`,
			type: "profile_change_approved",
			title: "Profile Change Submitted",
			message: `Your ${body.field} change request has been submitted for approval.`,
			isRead: false,
			createdAt: new Date().toISOString(),
			relatedId: newRequest.id,
		});

		return HttpResponse.json({ status: "success", data: newRequest });
	}),

	// Documents
	http.get("/api/ess/documents", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: documents });
	}),

	http.get("/api/ess/documents/:id/download", async () => {
		await delay(100);
		return new HttpResponse("PDF content", {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": "attachment; filename=document.pdf",
			},
		});
	}),
];

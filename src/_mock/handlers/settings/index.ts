import { faker } from "@faker-js/faker";
import { http, HttpResponse, delay } from "msw";

const mockEmployer = {
	id: "emp-1",
	companyName: "Acme Payroll Solutions",
	tradingName: "Acme Payroll",
	registrationNumber: "2020/123456/07",
	industry: "Professional Services",
	physicalAddress: {
		line1: "123 Main Street",
		line2: "Unit 4",
		city: "Johannesburg",
		province: "Gauteng",
		postalCode: "2000",
	},
	postalAddress: {
		line1: "PO Box 1234",
		city: "Johannesburg",
		province: "Gauteng",
		postalCode: "2000",
	},
	contactEmail: "admin@acmepayroll.co.za",
	contactPhone: "011 123 4567",
	payeNumber: "7123456789",
	uifNumber: "U123456789",
	sdlNumber: "L123456789",
	logoUrl: "",
	isComplete: true,
};

const mockBankAccounts = [
	{
		id: "bank-1",
		bankName: "Standard Bank",
		accountHolderName: "Acme Payroll Solutions",
		accountNumber: "001234567",
		branchCode: "051001",
		accountType: "current",
		eftFormat: "standard",
		isPrimary: true,
	},
];

const mockPayFrequencies = [
	{
		id: "freq-1",
		name: "Monthly",
		type: "monthly",
		startDate: "2024-01-01",
		cutOffDay: 25,
		payDay: 28,
		isActive: true,
	},
	{ id: "freq-2", name: "Weekly", type: "weekly", startDate: "2024-01-01", cutOffDay: 5, payDay: 5, isActive: true },
];

const mockPayPoints = [
	{ id: "pp-1", name: "Head Office", code: "HO", description: "Main office in Johannesburg", employeeCount: 25 },
	{ id: "pp-2", name: "Cape Town Branch", code: "CT", description: "Cape Town operations", employeeCount: 12 },
];

const mockJobGrades = [
	{ id: "jg-1", name: "Junior", code: "JNR", minimumWage: 4500 },
	{ id: "jg-2", name: "Intermediate", code: "INT", minimumWage: 8000 },
	{ id: "jg-3", name: "Senior", code: "SNR", minimumWage: 15000 },
];

const mockLeaveTypes = [
	{
		id: "lt-1",
		name: "Annual Leave",
		category: "annual",
		accrualMethod: "monthly",
		daysPerYear: 15,
		carryOverDays: 5,
		allowNegative: false,
		isActive: true,
	},
	{
		id: "lt-2",
		name: "Sick Leave",
		category: "sick",
		accrualMethod: "upfront",
		daysPerYear: 30,
		carryOverDays: 0,
		allowNegative: false,
		isActive: true,
	},
	{
		id: "lt-3",
		name: "Family Responsibility",
		category: "family",
		accrualMethod: "upfront",
		daysPerYear: 3,
		carryOverDays: 0,
		allowNegative: false,
		isActive: true,
	},
	{
		id: "lt-4",
		name: "Unpaid Leave",
		category: "unpaid",
		accrualMethod: "upfront",
		daysPerYear: 0,
		carryOverDays: 0,
		allowNegative: true,
		isActive: true,
	},
];

const mockPayrollItems = [
	{
		id: "pi-1",
		name: "Basic Salary",
		code: "BASIC",
		type: "earning",
		taxable: true,
		uifApplicable: true,
		isRecurring: true,
		isActive: true,
	},
	{
		id: "pi-2",
		name: "Overtime",
		code: "OT",
		type: "earning",
		taxable: true,
		uifApplicable: true,
		isRecurring: false,
		isActive: true,
	},
	{
		id: "pi-3",
		name: "Medical Aid",
		code: "MED",
		type: "deduction",
		taxable: false,
		uifApplicable: false,
		isRecurring: true,
		isActive: true,
	},
	{
		id: "pi-4",
		name: "Pension Fund",
		code: "PEN",
		type: "deduction",
		taxable: false,
		uifApplicable: false,
		isRecurring: true,
		isActive: true,
	},
];

const mockSalaryRules = {
	costToCompanyEnabled: false,
	proRataMethod: "calendar",
	terminationPayMethod: "next_payrun",
	etiEnabled: true,
	etiMaxAge: 29,
	overtimeRate: 1.5,
	sundayRate: 2.0,
	publicHolidayRate: 2.0,
};

const mockPayslipConfig = {
	showLogo: true,
	showEmployerAddress: true,
	showLeaveBalances: true,
	showYtdTotals: true,
	customFooterText: "",
};

const mockEmployeeNumbering = {
	autoGenerate: true,
	prefix: "EMP",
	startingNumber: 1001,
	allowManualOverride: true,
};

const mockCustomFields = [
	{
		id: "cf-1",
		name: "Shirt Size",
		fieldType: "select",
		options: ["S", "M", "L", "XL"],
		isRequired: false,
		isActive: true,
	},
];

const mockBeneficiaries = [
	{
		id: "ben-1",
		name: "Old Mutual Pension",
		bankName: "FNB",
		accountNumber: "62123456789",
		branchCode: "250655",
		reference: "PENSION",
		linkedPayrollItemIds: ["pi-4"],
	},
];

const mockNotificationSettings = {
	filingReminders: true,
	filingReminderDays: 5,
	payrollReminders: true,
	payrollReminderDays: 3,
	recipientEmails: ["admin@acmepayroll.co.za"],
};

const mockUsers = [
	{
		id: "u-1",
		email: "owner@acmepayroll.co.za",
		name: "John Owner",
		role: "owner",
		invitedAt: "2024-01-01",
		acceptedAt: "2024-01-01",
	},
	{
		id: "u-2",
		email: "admin@acmepayroll.co.za",
		name: "Jane Admin",
		role: "admin",
		invitedAt: "2024-01-15",
		acceptedAt: "2024-01-16",
	},
];

const mockSettingsCompletion = {
	employer: true,
	banking: true,
	payFrequencies: true,
	leaveTypes: true,
	salaryRules: true,
	percentage: 100,
};

export const settingsHandlers = [
	http.get("/api/settings/completion", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: mockSettingsCompletion });
	}),

	http.get("/api/settings/employer", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: mockEmployer });
	}),
	http.put("/api/settings/employer", async ({ request }) => {
		await delay(400);
		const body = await request.json();
		Object.assign(mockEmployer, body);
		return HttpResponse.json({ status: "success", data: mockEmployer });
	}),

	http.get("/api/settings/banking", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: mockBankAccounts });
	}),
	http.post("/api/settings/banking", async ({ request }) => {
		await delay(400);
		const body = (await request.json()) as Record<string, unknown>;
		const newAccount = { ...body, id: faker.string.uuid() };
		mockBankAccounts.push(newAccount as (typeof mockBankAccounts)[0]);
		return HttpResponse.json({ status: "success", data: newAccount });
	}),
	http.put("/api/settings/banking/:id", async ({ request, params }) => {
		await delay(400);
		const body = (await request.json()) as Record<string, unknown>;
		const index = mockBankAccounts.findIndex((a) => a.id === params.id);
		if (index >= 0) Object.assign(mockBankAccounts[index], body);
		return HttpResponse.json({ status: "success", data: mockBankAccounts[index] });
	}),

	http.get("/api/settings/pay-frequencies", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: mockPayFrequencies });
	}),
	http.post("/api/settings/pay-frequencies", async ({ request }) => {
		await delay(400);
		const body = (await request.json()) as Record<string, unknown>;
		const newFreq = { ...body, id: faker.string.uuid() };
		mockPayFrequencies.push(newFreq as (typeof mockPayFrequencies)[0]);
		return HttpResponse.json({ status: "success", data: newFreq });
	}),

	http.get("/api/settings/pay-points", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: mockPayPoints });
	}),
	http.post("/api/settings/pay-points", async ({ request }) => {
		await delay(400);
		const body = (await request.json()) as Record<string, unknown>;
		const newPoint = { ...body, id: faker.string.uuid(), employeeCount: 0 };
		mockPayPoints.push(newPoint as (typeof mockPayPoints)[0]);
		return HttpResponse.json({ status: "success", data: newPoint });
	}),

	http.get("/api/settings/job-grades", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: mockJobGrades });
	}),
	http.post("/api/settings/job-grades", async ({ request }) => {
		await delay(400);
		const body = (await request.json()) as Record<string, unknown>;
		const newGrade = { ...body, id: faker.string.uuid() };
		mockJobGrades.push(newGrade as (typeof mockJobGrades)[0]);
		return HttpResponse.json({ status: "success", data: newGrade });
	}),

	http.get("/api/settings/leave-types", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: mockLeaveTypes });
	}),
	http.post("/api/settings/leave-types", async ({ request }) => {
		await delay(400);
		const body = (await request.json()) as Record<string, unknown>;
		const newType = { ...body, id: faker.string.uuid() };
		mockLeaveTypes.push(newType as (typeof mockLeaveTypes)[0]);
		return HttpResponse.json({ status: "success", data: newType });
	}),

	http.get("/api/settings/payroll-items", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: mockPayrollItems });
	}),
	http.post("/api/settings/payroll-items", async ({ request }) => {
		await delay(400);
		const body = (await request.json()) as Record<string, unknown>;
		const newItem = { ...body, id: faker.string.uuid() };
		mockPayrollItems.push(newItem as (typeof mockPayrollItems)[0]);
		return HttpResponse.json({ status: "success", data: newItem });
	}),

	http.get("/api/settings/salary-rules", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: mockSalaryRules });
	}),
	http.put("/api/settings/salary-rules", async ({ request }) => {
		await delay(400);
		const body = await request.json();
		Object.assign(mockSalaryRules, body);
		return HttpResponse.json({ status: "success", data: mockSalaryRules });
	}),

	http.get("/api/settings/payslips", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: mockPayslipConfig });
	}),
	http.put("/api/settings/payslips", async ({ request }) => {
		await delay(400);
		const body = await request.json();
		Object.assign(mockPayslipConfig, body);
		return HttpResponse.json({ status: "success", data: mockPayslipConfig });
	}),

	http.get("/api/settings/employee-numbers", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: mockEmployeeNumbering });
	}),
	http.put("/api/settings/employee-numbers", async ({ request }) => {
		await delay(400);
		const body = await request.json();
		Object.assign(mockEmployeeNumbering, body);
		return HttpResponse.json({ status: "success", data: mockEmployeeNumbering });
	}),

	http.get("/api/settings/custom-fields", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: mockCustomFields });
	}),
	http.post("/api/settings/custom-fields", async ({ request }) => {
		await delay(400);
		const body = (await request.json()) as Record<string, unknown>;
		const newField = { ...body, id: faker.string.uuid() };
		mockCustomFields.push(newField as (typeof mockCustomFields)[0]);
		return HttpResponse.json({ status: "success", data: newField });
	}),

	http.get("/api/settings/beneficiaries", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: mockBeneficiaries });
	}),
	http.post("/api/settings/beneficiaries", async ({ request }) => {
		await delay(400);
		const body = (await request.json()) as Record<string, unknown>;
		const newBen = { ...body, id: faker.string.uuid() };
		mockBeneficiaries.push(newBen as (typeof mockBeneficiaries)[0]);
		return HttpResponse.json({ status: "success", data: newBen });
	}),

	http.get("/api/settings/notifications", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: mockNotificationSettings });
	}),
	http.put("/api/settings/notifications", async ({ request }) => {
		await delay(400);
		const body = await request.json();
		Object.assign(mockNotificationSettings, body);
		return HttpResponse.json({ status: "success", data: mockNotificationSettings });
	}),

	http.get("/api/settings/users", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: mockUsers });
	}),
	http.post("/api/settings/users", async ({ request }) => {
		await delay(400);
		const body = (await request.json()) as Record<string, unknown>;
		const newUser = { ...body, id: faker.string.uuid(), invitedAt: new Date().toISOString() };
		mockUsers.push(newUser as (typeof mockUsers)[0]);
		return HttpResponse.json({ status: "success", data: newUser });
	}),
];

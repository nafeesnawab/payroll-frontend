import { delay, HttpResponse, http } from "msw";
import type { EmployeeTransfer, GroupCompany, GroupOverview, GroupSetting, TransferImpact } from "@/types/group";

const groupCompanies: GroupCompany[] = [
	{
		id: "company-1",
		legalName: "PayPilot Holdings (Pty) Ltd",
		tradingName: "PayPilot Holdings",
		registrationNumber: "2020/123456/07",
		payeNumber: "7123456789",
		uifNumber: "U123456789",
		sdlNumber: "L123456789",
		status: "active",
		employeeCount: 156,
		lastPayrollRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
		createdAt: "2020-01-15T00:00:00Z",
	},
	{
		id: "company-2",
		legalName: "PayPilot Services (Pty) Ltd",
		tradingName: "PayPilot Services",
		registrationNumber: "2021/234567/07",
		payeNumber: "7234567890",
		uifNumber: "U234567890",
		sdlNumber: "L234567890",
		status: "active",
		employeeCount: 89,
		lastPayrollRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
		createdAt: "2021-03-20T00:00:00Z",
	},
	{
		id: "company-3",
		legalName: "PayPilot Tech (Pty) Ltd",
		tradingName: "PayPilot Tech",
		registrationNumber: "2022/345678/07",
		payeNumber: "7345678901",
		uifNumber: "U345678901",
		sdlNumber: "L345678901",
		status: "active",
		employeeCount: 45,
		lastPayrollRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
		createdAt: "2022-06-10T00:00:00Z",
	},
	{
		id: "company-4",
		legalName: "PayPilot Consulting (Pty) Ltd",
		tradingName: "PayPilot Consulting",
		registrationNumber: "2023/456789/07",
		payeNumber: "7456789012",
		uifNumber: "U456789012",
		sdlNumber: "L456789012",
		status: "suspended",
		employeeCount: 12,
		createdAt: "2023-01-05T00:00:00Z",
	},
];

const groupSettings: GroupSetting[] = [
	{
		id: "setting-1",
		name: "Standard Leave Days",
		category: "Leave Types",
		inheritanceMode: "enforced",
		groupValue: 15,
		description: "Annual leave days per year",
	},
	{
		id: "setting-2",
		name: "Sick Leave Days",
		category: "Leave Types",
		inheritanceMode: "enforced",
		groupValue: 30,
		description: "Sick leave days per 3-year cycle",
	},
	{
		id: "setting-3",
		name: "Pay Frequency",
		category: "Pay Frequencies",
		inheritanceMode: "override_allowed",
		groupValue: "monthly",
		description: "Default pay frequency for employees",
	},
	{
		id: "setting-4",
		name: "Working Hours",
		category: "Working Calendar",
		inheritanceMode: "override_allowed",
		groupValue: 8,
		description: "Standard working hours per day",
	},
	{
		id: "setting-5",
		name: "Overtime Rate",
		category: "Payroll Items",
		inheritanceMode: "enforced",
		groupValue: 1.5,
		description: "Overtime multiplier for normal overtime",
	},
	{
		id: "setting-6",
		name: "Sunday Rate",
		category: "Payroll Items",
		inheritanceMode: "enforced",
		groupValue: 2,
		description: "Overtime multiplier for Sunday work",
	},
	{
		id: "setting-7",
		name: "Public Holiday Rate",
		category: "Holiday Rules",
		inheritanceMode: "enforced",
		groupValue: 2,
		description: "Pay multiplier for public holidays",
	},
	{
		id: "setting-8",
		name: "Accounting System",
		category: "Accounting Integration",
		inheritanceMode: "company_only",
		groupValue: "none",
		description: "Integrated accounting system",
	},
];

const employeeTransfers: EmployeeTransfer[] = [
	{
		id: "transfer-1",
		employeeId: "emp-1",
		employeeName: "John Smith",
		employeeNumber: "EMP001",
		sourceCompanyId: "company-1",
		sourceCompanyName: "PayPilot Holdings",
		destinationCompanyId: "company-2",
		destinationCompanyName: "PayPilot Services",
		effectiveDate: "2025-01-15",
		status: "completed",
		preserveLeaveBalances: true,
		preserveServiceDate: true,
		resetTaxYear: false,
		createdBy: "Admin User",
		createdAt: "2025-01-10T10:00:00Z",
		completedAt: "2025-01-15T00:00:00Z",
	},
	{
		id: "transfer-2",
		employeeId: "emp-2",
		employeeName: "Sarah Johnson",
		employeeNumber: "EMP002",
		sourceCompanyId: "company-2",
		sourceCompanyName: "PayPilot Services",
		destinationCompanyId: "company-3",
		destinationCompanyName: "PayPilot Tech",
		effectiveDate: "2025-02-01",
		status: "pending",
		preserveLeaveBalances: true,
		preserveServiceDate: true,
		resetTaxYear: false,
		createdBy: "HR Manager",
		createdAt: "2025-01-25T14:30:00Z",
	},
];

const mockEmployees = [
	{ id: "emp-10", name: "Alice Brown", employeeNumber: "EMP010", companyId: "company-1" },
	{ id: "emp-11", name: "Bob Wilson", employeeNumber: "EMP011", companyId: "company-1" },
	{ id: "emp-12", name: "Carol Davis", employeeNumber: "EMP012", companyId: "company-1" },
	{ id: "emp-20", name: "David Lee", employeeNumber: "EMP020", companyId: "company-2" },
	{ id: "emp-21", name: "Eva Martinez", employeeNumber: "EMP021", companyId: "company-2" },
	{ id: "emp-30", name: "Frank Taylor", employeeNumber: "EMP030", companyId: "company-3" },
];

export const groupHandlers = [
	// Group Overview
	http.get("/api/group/overview", async () => {
		await delay(200);
		const totalEmployees = groupCompanies.reduce((sum, c) => sum + c.employeeCount, 0);
		const activePayrolls = groupCompanies.filter((c) => c.status === "active").length;

		const overview: GroupOverview = {
			groupId: "group-1",
			groupName: "PayPilot Group",
			totalCompanies: groupCompanies.length,
			totalEmployees,
			activePayrolls,
			complianceAlerts: 2,
			billingStatus: "current",
		};

		return HttpResponse.json({ status: "success", data: overview });
	}),

	// Get Companies
	http.get("/api/group/companies", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: groupCompanies });
	}),

	// Create Company
	http.post("/api/group/companies", async ({ request }) => {
		await delay(300);
		const body = (await request.json()) as {
			legalName: string;
			tradingName: string;
			registrationNumber: string;
			payeNumber: string;
			uifNumber: string;
			sdlNumber: string;
		};

		const newCompany: GroupCompany = {
			id: `company-${Date.now()}`,
			legalName: body.legalName,
			tradingName: body.tradingName || body.legalName,
			registrationNumber: body.registrationNumber,
			payeNumber: body.payeNumber,
			uifNumber: body.uifNumber,
			sdlNumber: body.sdlNumber,
			status: "pending",
			employeeCount: 0,
			createdAt: new Date().toISOString(),
		};

		groupCompanies.push(newCompany);
		return HttpResponse.json({ status: "success", data: newCompany });
	}),

	// Update Company
	http.put("/api/group/companies/:id", async ({ params, request }) => {
		await delay(200);
		const body = (await request.json()) as Partial<GroupCompany>;
		const index = groupCompanies.findIndex((c) => c.id === params.id);

		if (index === -1) {
			return HttpResponse.json({ status: "error", message: "Company not found" }, { status: 404 });
		}

		groupCompanies[index] = { ...groupCompanies[index], ...body };
		return HttpResponse.json({ status: "success", data: groupCompanies[index] });
	}),

	// Get Group Settings
	http.get("/api/group/settings", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: groupSettings });
	}),

	// Update Group Settings
	http.put("/api/group/settings", async ({ request }) => {
		await delay(300);
		const body = (await request.json()) as { settings: GroupSetting[] };

		body.settings.forEach((updated) => {
			const index = groupSettings.findIndex((s) => s.id === updated.id);
			if (index !== -1) {
				groupSettings[index] = updated;
			}
		});

		return HttpResponse.json({ status: "success", data: groupSettings });
	}),

	// Get Transfers
	http.get("/api/group/transfers", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: employeeTransfers });
	}),

	// Get Employees for Transfer
	http.get("/api/group/transfers/employees", async ({ request }) => {
		await delay(200);
		const url = new URL(request.url);
		const companyId = url.searchParams.get("companyId");

		const employees = mockEmployees.filter((e) => e.companyId === companyId);
		return HttpResponse.json({ status: "success", data: employees });
	}),

	// Preview Transfer
	http.post("/api/group/transfers/preview", async () => {
		await delay(300);

		const impact: TransferImpact = {
			leaveBalances: [
				{ type: "Annual Leave", balance: 12.5 },
				{ type: "Sick Leave", balance: 18 },
				{ type: "Family Responsibility", balance: 3 },
			],
			serviceYears: 3,
			currentSalary: 45000,
			taxYearEarnings: 180000,
			warnings: [
				"Employee has pending leave request that will be cancelled",
				"Different pay frequency at destination company",
			],
		};

		return HttpResponse.json({ status: "success", data: impact });
	}),

	// Execute Transfer
	http.post("/api/group/transfers", async ({ request }) => {
		await delay(500);
		const body = (await request.json()) as {
			employeeId: string;
			sourceCompanyId: string;
			destinationCompanyId: string;
			effectiveDate: string;
			preserveLeaveBalances: boolean;
			preserveServiceDate: boolean;
			resetTaxYear: boolean;
		};

		const sourceCompany = groupCompanies.find((c) => c.id === body.sourceCompanyId);
		const destCompany = groupCompanies.find((c) => c.id === body.destinationCompanyId);
		const employee = mockEmployees.find((e) => e.id === body.employeeId);

		const newTransfer: EmployeeTransfer = {
			id: `transfer-${Date.now()}`,
			employeeId: body.employeeId,
			employeeName: employee?.name || "Unknown",
			employeeNumber: employee?.employeeNumber || "N/A",
			sourceCompanyId: body.sourceCompanyId,
			sourceCompanyName: sourceCompany?.tradingName || "Unknown",
			destinationCompanyId: body.destinationCompanyId,
			destinationCompanyName: destCompany?.tradingName || "Unknown",
			effectiveDate: body.effectiveDate,
			status: "completed",
			preserveLeaveBalances: body.preserveLeaveBalances,
			preserveServiceDate: body.preserveServiceDate,
			resetTaxYear: body.resetTaxYear,
			createdBy: "Current User",
			createdAt: new Date().toISOString(),
			completedAt: new Date().toISOString(),
		};

		employeeTransfers.unshift(newTransfer);
		return HttpResponse.json({ status: "success", data: newTransfer });
	}),

	// Get Single Company
	http.get("/api/group/companies/:id", async ({ params }) => {
		await delay(200);
		const company = groupCompanies.find((c) => c.id === params.id);
		if (!company) {
			return HttpResponse.json({ status: "error", message: "Company not found" }, { status: 404 });
		}
		return HttpResponse.json({ status: "success", data: company });
	}),

	// Get Company Overrides
	http.get("/api/group/companies/:id/overrides", async () => {
		await delay(200);
		const overrides = [
			{
				settingId: "setting-3",
				settingName: "Pay Frequency",
				inheritedValue: "monthly",
				overriddenValue: "weekly",
				overriddenAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
				overriddenBy: "Admin User",
			},
			{
				settingId: "setting-4",
				settingName: "Working Hours",
				inheritedValue: 8,
				overriddenValue: 7.5,
				overriddenAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
				overriddenBy: "HR Manager",
			},
		];
		return HttpResponse.json({ status: "success", data: overrides });
	}),

	// Delete Company Override
	http.delete("/api/group/companies/:id/overrides/:settingId", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", message: "Override reset" });
	}),
];

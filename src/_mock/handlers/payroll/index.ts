import { faker } from "@faker-js/faker";
import { http, HttpResponse, delay } from "msw";
import type { Payrun, PayrunListItem, PayrunEmployee, EmployeePayslip, PayrunSummary } from "@/types/payroll";

const generatePayslipEarnings = (baseSalary: number) => [
	{ id: "e-1", name: "Basic Salary", code: "BASIC", amount: baseSalary, taxable: true, isRequired: true },
	{ id: "e-2", name: "Overtime", code: "OT", amount: Math.random() > 0.7 ? faker.number.int({ min: 500, max: 3000 }) : 0, hours: 8, rate: baseSalary / 160 * 1.5, taxable: true, isRequired: false },
	{ id: "e-3", name: "Travel Allowance", code: "TRAVEL", amount: Math.random() > 0.5 ? 2500 : 0, taxable: true, isRequired: false },
	{ id: "e-4", name: "Bonus", code: "BONUS", amount: 0, taxable: true, isRequired: false },
];

const generatePayslipDeductions = (grossPay: number) => {
	const paye = Math.round(grossPay * 0.25);
	const uif = Math.round(Math.min(grossPay * 0.01, 177.12));
	return [
		{ id: "d-1", name: "PAYE", code: "PAYE", amount: paye, isSkipped: false, isRequired: true },
		{ id: "d-2", name: "UIF", code: "UIF", amount: uif, isSkipped: false, isRequired: true },
		{ id: "d-3", name: "Medical Aid", code: "MED", amount: Math.random() > 0.5 ? 2500 : 0, isSkipped: false, isRequired: false },
		{ id: "d-4", name: "Pension Fund", code: "PENSION", amount: Math.round(grossPay * 0.075), isSkipped: false, isRequired: false },
	];
};

const mockPayruns: Payrun[] = [
	{
		id: "pr-1",
		payPeriod: "January 2026",
		payPeriodStart: "2026-01-01",
		payPeriodEnd: "2026-01-31",
		payDate: "2026-01-28",
		payFrequencyId: "freq-1",
		payFrequencyName: "Monthly",
		status: "draft",
		employeeCount: 25,
		totalGross: 875000,
		totalDeductions: 262500,
		totalNet: 612500,
		employeesWithErrors: 2,
		createdAt: "2026-01-15T08:00:00Z",
	},
	{
		id: "pr-2",
		payPeriod: "December 2025",
		payPeriodStart: "2025-12-01",
		payPeriodEnd: "2025-12-31",
		payDate: "2025-12-28",
		payFrequencyId: "freq-1",
		payFrequencyName: "Monthly",
		status: "finalized",
		employeeCount: 24,
		totalGross: 840000,
		totalDeductions: 252000,
		totalNet: 588000,
		employeesWithErrors: 0,
		createdAt: "2025-12-10T08:00:00Z",
		finalizedAt: "2025-12-27T14:30:00Z",
	},
	{
		id: "pr-3",
		payPeriod: "November 2025",
		payPeriodStart: "2025-11-01",
		payPeriodEnd: "2025-11-30",
		payDate: "2025-11-28",
		payFrequencyId: "freq-1",
		payFrequencyName: "Monthly",
		status: "finalized",
		employeeCount: 23,
		totalGross: 805000,
		totalDeductions: 241500,
		totalNet: 563500,
		employeesWithErrors: 0,
		createdAt: "2025-11-10T08:00:00Z",
		finalizedAt: "2025-11-27T16:00:00Z",
	},
];

const generatePayrunEmployees = (payrunId: string): PayrunEmployee[] => {
	return Array.from({ length: 25 }, (_, i) => {
		const baseSalary = faker.number.int({ min: 15000, max: 65000 });
		const deductions = Math.round(baseSalary * 0.3);
		const hasErrors = i < 2;
		return {
			id: `${payrunId}-emp-${i + 1}`,
			employeeId: `emp-${i + 1}`,
			employeeNumber: `EMP${1001 + i}`,
			employeeName: faker.person.fullName(),
			grossPay: baseSalary,
			totalDeductions: deductions,
			netPay: baseSalary - deductions,
			hasErrors,
			errors: hasErrors ? ["Missing tax number", "Bank details incomplete"] : undefined,
		};
	});
};

const generateEmployeePayslip = (payrunId: string, employeeId: string): EmployeePayslip => {
	const baseSalary = faker.number.int({ min: 15000, max: 65000 });
	const earnings = generatePayslipEarnings(baseSalary);
	const grossPay = earnings.reduce((sum, e) => sum + e.amount, 0);
	const deductions = generatePayslipDeductions(grossPay);
	const totalDeductions = deductions.filter(d => !d.isSkipped).reduce((sum, d) => sum + d.amount, 0);

	return {
		id: `${payrunId}-${employeeId}`,
		payrunId,
		employeeId,
		employeeNumber: `EMP${1001 + Number.parseInt(employeeId.split("-")[1] || "1")}`,
		employeeName: faker.person.fullName(),
		payPeriod: "January 2026",
		payDate: "2026-01-28",
		earnings,
		deductions,
		grossPay,
		totalDeductions,
		netPay: grossPay - totalDeductions,
		hasErrors: Number.parseInt(employeeId.split("-")[1] || "0") < 3,
		errors: Number.parseInt(employeeId.split("-")[1] || "0") < 3 ? ["Missing tax number"] : undefined,
		ytdGross: grossPay * 12,
		ytdTax: totalDeductions * 12,
		ytdNet: (grossPay - totalDeductions) * 12,
	};
};

export const payrollHandlers = [
	http.get("/api/payruns", async ({ request }) => {
		await delay(400);
		const url = new URL(request.url);
		const status = url.searchParams.get("status");

		let filtered = [...mockPayruns];
		if (status && status !== "all") {
			filtered = filtered.filter((p) => p.status === status);
		}

		const listItems: PayrunListItem[] = filtered.map((p) => ({
			id: p.id,
			payPeriod: p.payPeriod,
			payFrequencyName: p.payFrequencyName,
			status: p.status,
			employeeCount: p.employeeCount,
			totalGross: p.totalGross,
			totalNet: p.totalNet,
		}));

		return HttpResponse.json({ status: "success", data: listItems });
	}),

	http.get("/api/payruns/:id", async ({ params }) => {
		await delay(300);
		const payrun = mockPayruns.find((p) => p.id === params.id);
		if (!payrun) {
			return HttpResponse.json({ status: "error", message: "Payrun not found" }, { status: 404 });
		}
		return HttpResponse.json({ status: "success", data: payrun });
	}),

	http.post("/api/payruns", async ({ request }) => {
		await delay(500);
		const body = await request.json() as Record<string, unknown>;
		const newPayrun: Payrun = {
			id: `pr-${mockPayruns.length + 1}`,
			payPeriod: "February 2026",
			payPeriodStart: body.payPeriodStart as string,
			payPeriodEnd: body.payPeriodEnd as string,
			payDate: body.payDate as string,
			payFrequencyId: body.payFrequencyId as string,
			payFrequencyName: "Monthly",
			status: "draft",
			employeeCount: 25,
			totalGross: 0,
			totalDeductions: 0,
			totalNet: 0,
			employeesWithErrors: 0,
			createdAt: new Date().toISOString(),
		};
		mockPayruns.unshift(newPayrun);
		return HttpResponse.json({ status: "success", data: newPayrun });
	}),

	http.delete("/api/payruns/:id", async ({ params }) => {
		await delay(300);
		const index = mockPayruns.findIndex((p) => p.id === params.id);
		if (index === -1) {
			return HttpResponse.json({ status: "error", message: "Payrun not found" }, { status: 404 });
		}
		if (mockPayruns[index].status === "finalized") {
			return HttpResponse.json({ status: "error", message: "Cannot delete finalized payrun" }, { status: 400 });
		}
		mockPayruns.splice(index, 1);
		return HttpResponse.json({ status: "success", message: "Payrun deleted" });
	}),

	http.post("/api/payruns/:id/calculate", async ({ params }) => {
		await delay(1500);
		const payrun = mockPayruns.find((p) => p.id === params.id);
		if (!payrun) {
			return HttpResponse.json({ status: "error", message: "Payrun not found" }, { status: 404 });
		}
		payrun.status = "ready";
		payrun.totalGross = 875000;
		payrun.totalDeductions = 262500;
		payrun.totalNet = 612500;
		return HttpResponse.json({ status: "success", data: payrun });
	}),

	http.post("/api/payruns/:id/finalize", async ({ params }) => {
		await delay(1000);
		const payrun = mockPayruns.find((p) => p.id === params.id);
		if (!payrun) {
			return HttpResponse.json({ status: "error", message: "Payrun not found" }, { status: 404 });
		}
		if (payrun.employeesWithErrors > 0) {
			return HttpResponse.json({ status: "error", message: "Cannot finalize with employee errors" }, { status: 400 });
		}
		payrun.status = "finalized";
		payrun.finalizedAt = new Date().toISOString();
		return HttpResponse.json({ status: "success", data: payrun });
	}),

	http.get("/api/payruns/:id/employees", async ({ params }) => {
		await delay(400);
		const employees = generatePayrunEmployees(params.id as string);
		return HttpResponse.json({ status: "success", data: employees });
	}),

	http.get("/api/payruns/:id/payslip/:employeeId", async ({ params }) => {
		await delay(300);
		const payslip = generateEmployeePayslip(params.id as string, params.employeeId as string);
		return HttpResponse.json({ status: "success", data: payslip });
	}),

	http.put("/api/payruns/:id/payslip/:employeeId", async ({ params, request }) => {
		await delay(400);
		const body = await request.json() as Record<string, unknown>;
		const payslip = generateEmployeePayslip(params.id as string, params.employeeId as string);
		return HttpResponse.json({ status: "success", data: { ...payslip, ...body } });
	}),

	http.get("/api/payruns/:id/summary", async () => {
		await delay(300);
		const summary: PayrunSummary = {
			totalGross: 875000,
			totalPAYE: 218750,
			totalUIF: 4428,
			totalSDL: 8750,
			totalOtherDeductions: 30572,
			totalNet: 612500,
			employerUIF: 4428,
			employerSDL: 8750,
			totalCostToCompany: 888178,
		};
		return HttpResponse.json({ status: "success", data: summary });
	}),

	http.get("/api/payruns/:id/export/eft", async () => {
		await delay(500);
		return HttpResponse.json({
			status: "success",
			data: { filename: "eft_january_2026.csv", url: "/downloads/eft_january_2026.csv" },
		});
	}),

	http.get("/api/payruns/:id/export/payslips", async () => {
		await delay(500);
		return HttpResponse.json({
			status: "success",
			data: { filename: "payslips_january_2026.pdf", url: "/downloads/payslips_january_2026.pdf" },
		});
	}),
];

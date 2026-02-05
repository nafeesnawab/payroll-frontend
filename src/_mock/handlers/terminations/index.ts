import { faker } from "@faker-js/faker";
import { delay, http, HttpResponse } from "msw";
import type { Termination, TerminationDetail, TerminationPayComponents, TerminationStatus, TerminationReason } from "@/types/termination";

const reasons: TerminationReason[] = ["resignation", "dismissal", "retrenchment", "contract_end", "death"];
const statuses: TerminationStatus[] = ["draft", "pending_payroll", "completed"];

const generateTerminations = (): Termination[] => {
	return Array.from({ length: 12 }, () => {
		const status = faker.helpers.arrayElement(statuses);
		return {
			id: faker.string.uuid(),
			employeeId: faker.string.uuid(),
			employeeName: faker.person.fullName(),
			employeeNumber: `EMP${faker.string.numeric(4)}`,
			terminationDate: faker.date.recent({ days: 90 }).toISOString().split("T")[0],
			lastWorkingDay: faker.date.recent({ days: 90 }).toISOString().split("T")[0],
			reason: faker.helpers.arrayElement(reasons),
			status,
			noticePeriodDays: faker.helpers.arrayElement([7, 14, 30]),
			paidInLieu: faker.datatype.boolean(),
			finalPayPeriod: faker.date.recent().toISOString().split("T")[0],
			createdAt: faker.date.past().toISOString(),
			updatedAt: faker.date.recent().toISOString(),
			finalizedAt: status === "completed" ? faker.date.recent().toISOString() : null,
			finalizedBy: status === "completed" ? faker.person.fullName() : null,
		};
	});
};

const generatePayComponents = (): TerminationPayComponents => {
	const finalSalary = faker.number.int({ min: 15000, max: 50000 });
	const noticePay = faker.number.int({ min: 0, max: 20000 });
	const severancePay = faker.number.int({ min: 0, max: 30000 });
	const proRataEarnings = faker.number.int({ min: 0, max: 5000 });
	const leavePayoutDays = faker.number.int({ min: 0, max: 15 });
	const leavePayoutAmount = leavePayoutDays * (finalSalary / 21.67);
	const grossPay = finalSalary + noticePay + severancePay + proRataEarnings + leavePayoutAmount;
	const paye = grossPay * 0.25;
	const uif = Math.min(grossPay * 0.01, 177.12);
	const deductions = [
		{ id: "1", name: "PAYE", amount: paye, skip: false },
		{ id: "2", name: "UIF", amount: uif, skip: false },
		{ id: "3", name: "Medical Aid", amount: 2500, skip: false },
		{ id: "4", name: "Pension Fund", amount: finalSalary * 0.075, skip: false },
	];
	const totalDeductions = deductions.filter((d) => !d.skip).reduce((sum, d) => sum + d.amount, 0);

	return {
		earnings: { finalSalary, noticePay, severancePay, proRataEarnings, leavePayoutDays, leavePayoutAmount },
		deductions,
		summary: { grossPay, totalDeductions, netPay: grossPay - totalDeductions, paye, uif },
	};
};

const terminations = generateTerminations();

export const terminationHandlers = [
	http.get("/api/terminations", async ({ request }) => {
		await delay(300);
		const url = new URL(request.url);
		const status = url.searchParams.get("status");
		let filtered = [...terminations];
		if (status && status !== "all") {
			filtered = filtered.filter((t) => t.status === status);
		}
		return HttpResponse.json({ data: filtered });
	}),

	http.get("/api/terminations/:id", async ({ params }) => {
		await delay(300);
		const termination = terminations.find((t) => t.id === params.id);
		if (!termination) {
			return HttpResponse.json({ error: "Not found" }, { status: 404 });
		}
		const detail: TerminationDetail = {
			...termination,
			payComponents: generatePayComponents(),
			documents: termination.status === "completed" ? [
				{ id: "1", type: "final_payslip", name: "Final Payslip.pdf", generatedAt: new Date().toISOString(), downloadUrl: "#" },
				{ id: "2", type: "uif_ui27", name: "UI-2.7 Declaration.pdf", generatedAt: new Date().toISOString(), downloadUrl: "#" },
			] : [],
			auditLog: [
				{ id: "1", action: "Termination initiated", user: "Admin", timestamp: termination.createdAt },
				...(termination.finalizedAt ? [{ id: "2", action: "Finalized", user: termination.finalizedBy || "Admin", timestamp: termination.finalizedAt }] : []),
			],
		};
		return HttpResponse.json({ data: detail });
	}),

	http.post("/api/terminations", async ({ request }) => {
		await delay(500);
		const body = await request.json() as Record<string, unknown>;
		const newTermination: Termination = {
			id: faker.string.uuid(),
			employeeId: body.employeeId as string,
			employeeName: faker.person.fullName(),
			employeeNumber: `EMP${faker.string.numeric(4)}`,
			terminationDate: body.terminationDate as string,
			lastWorkingDay: body.lastWorkingDay as string,
			reason: body.reason as TerminationReason,
			status: "draft",
			noticePeriodDays: 30,
			paidInLieu: body.paidInLieu as boolean,
			finalPayPeriod: body.terminationDate as string,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			finalizedAt: null,
			finalizedBy: null,
		};
		terminations.unshift(newTermination);
		return HttpResponse.json({ data: newTermination });
	}),

	http.get("/api/terminations/:id/pay", async ({ params }) => {
		await delay(300);
		const termination = terminations.find((t) => t.id === params.id);
		if (!termination) {
			return HttpResponse.json({ error: "Not found" }, { status: 404 });
		}
		return HttpResponse.json({ data: generatePayComponents() });
	}),

	http.put("/api/terminations/:id/pay", async ({ params }) => {
		await delay(300);
		const termination = terminations.find((t) => t.id === params.id);
		if (!termination) {
			return HttpResponse.json({ error: "Not found" }, { status: 404 });
		}
		termination.status = "pending_payroll";
		return HttpResponse.json({ success: true });
	}),

	http.get("/api/terminations/:id/preview", async ({ params }) => {
		await delay(300);
		const termination = terminations.find((t) => t.id === params.id);
		if (!termination) {
			return HttpResponse.json({ error: "Not found" }, { status: 404 });
		}
		return HttpResponse.json({
			data: {
				employeeName: termination.employeeName,
				employeeNumber: termination.employeeNumber,
				terminationDate: termination.terminationDate,
				reason: termination.reason,
				payComponents: generatePayComponents(),
				validation: {
					errors: [],
					warnings: [{ code: "W001", message: "Leave balance will be paid out" }],
				},
			},
		});
	}),

	http.post("/api/terminations/:id/finalize", async ({ params }) => {
		await delay(800);
		const termination = terminations.find((t) => t.id === params.id);
		if (!termination) {
			return HttpResponse.json({ error: "Not found" }, { status: 404 });
		}
		termination.status = "completed";
		termination.finalizedAt = new Date().toISOString();
		termination.finalizedBy = "Current User";
		return HttpResponse.json({ success: true });
	}),

	http.get("/api/employees/active", async () => {
		await delay(200);
		return HttpResponse.json({
			data: Array.from({ length: 20 }, () => ({
				id: faker.string.uuid(),
				name: faker.person.fullName(),
				employeeNumber: `EMP${faker.string.numeric(4)}`,
			})),
		});
	}),
];

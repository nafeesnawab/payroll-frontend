import { faker } from "@faker-js/faker";
import { delay, http, HttpResponse } from "msw";
import type {
	EMP201,
	EMP201Detail,
	EMP501,
	EMP501Detail,
	FilingOverview,
	FilingStatus,
	IRP5Certificate,
	UIFDeclaration,
} from "@/types/filing";

const statuses: FilingStatus[] = ["draft", "ready", "submitted", "accepted", "rejected"];

const generateEMP201List = (): EMP201[] => {
	const items: EMP201[] = [];
	const currentDate = new Date();
	for (let i = 0; i < 12; i++) {
		const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
		const status = i === 0 ? "draft" : i < 3 ? faker.helpers.arrayElement(["ready", "submitted"]) : "accepted";
		items.push({
			id: faker.string.uuid(),
			period: `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`,
			month: date.getMonth() + 1,
			year: date.getFullYear(),
			status,
			totalPaye: faker.number.int({ min: 50000, max: 200000 }),
			totalUif: faker.number.int({ min: 5000, max: 20000 }),
			totalSdl: faker.number.int({ min: 3000, max: 15000 }),
			totalEmployees: faker.number.int({ min: 10, max: 50 }),
			submissionDate: status === "submitted" || status === "accepted" ? faker.date.recent().toISOString() : null,
			submittedBy: status === "submitted" || status === "accepted" ? faker.person.fullName() : null,
			payrunIds: [faker.string.uuid()],
			createdAt: faker.date.past().toISOString(),
			updatedAt: faker.date.recent().toISOString(),
		});
	}
	return items;
};

const generateUIFDeclarations = (): UIFDeclaration[] => {
	return Array.from({ length: 15 }, () => ({
		id: faker.string.uuid(),
		employeeId: faker.string.uuid(),
		employeeName: faker.person.fullName(),
		employeeNumber: `EMP${faker.string.numeric(4)}`,
		idNumber: faker.string.numeric(13),
		declarationType: faker.helpers.arrayElement(["start", "update", "termination"] as const),
		status: faker.helpers.arrayElement(statuses),
		effectiveDate: faker.date.past().toISOString().split("T")[0],
		lastUpdated: faker.date.recent().toISOString(),
		submittedDate: faker.datatype.boolean() ? faker.date.recent().toISOString() : null,
	}));
};

const generateIRP5Certificates = (): IRP5Certificate[] => {
	return Array.from({ length: 20 }, () => ({
		id: faker.string.uuid(),
		employeeId: faker.string.uuid(),
		employeeName: faker.person.fullName(),
		employeeNumber: `EMP${faker.string.numeric(4)}`,
		taxNumber: faker.string.numeric(10),
		taxYear: "2025",
		certificateType: faker.helpers.arrayElement(["IRP5", "IT3a"] as const),
		status: faker.helpers.arrayElement(["draft", "generated", "issued"] as const),
		grossIncome: faker.number.int({ min: 200000, max: 1500000 }),
		totalPaye: faker.number.int({ min: 30000, max: 400000 }),
		generatedAt: faker.datatype.boolean() ? faker.date.recent().toISOString() : null,
		issuedAt: null,
	}));
};

const emp201List = generateEMP201List();
const uifDeclarations = generateUIFDeclarations();
const irp5Certificates = generateIRP5Certificates();

export const filingHandlers = [
	// Filing Overview
	http.get("/api/filings/overview", async () => {
		await delay(300);
		const currentEmp201 = emp201List[0];
		const overview: FilingOverview = {
			emp201: {
				currentPeriod: currentEmp201.period,
				status: currentEmp201.status,
				dueDate: faker.date.soon({ days: 7 }).toISOString().split("T")[0],
				totalPaye: currentEmp201.totalPaye,
				totalUif: currentEmp201.totalUif,
				totalSdl: currentEmp201.totalSdl,
			},
			emp501: {
				taxYear: "2025",
				status: "draft",
				type: "interim",
				dueDate: "2025-10-31",
			},
			irp5: {
				taxYear: "2025",
				totalCertificates: irp5Certificates.length,
				generatedCount: irp5Certificates.filter((c) => c.status !== "draft").length,
				status: "in_progress",
			},
			uif: {
				pendingDeclarations: uifDeclarations.filter((d) => d.status === "draft" || d.status === "ready").length,
				lastSubmission: faker.date.recent().toISOString(),
			},
			alerts: [
				{
					id: "1",
					type: "warning",
					title: "EMP201 Due Soon",
					message: `${currentEmp201.period} EMP201 is due in 7 days`,
					filingType: "emp201",
					dueDate: faker.date.soon({ days: 7 }).toISOString().split("T")[0],
				},
				{
					id: "2",
					type: "info",
					title: "UIF Declarations Pending",
					message: `${uifDeclarations.filter((d) => d.status === "draft").length} UIF declarations awaiting submission`,
					filingType: "uif",
				},
			],
		};
		return HttpResponse.json({ data: overview });
	}),

	// EMP201 List
	http.get("/api/filings/emp201", async () => {
		await delay(300);
		return HttpResponse.json({ data: emp201List });
	}),

	// EMP201 Detail
	http.get("/api/filings/emp201/:id", async ({ params }) => {
		await delay(300);
		const emp201 = emp201List.find((e) => e.id === params.id);
		if (!emp201) {
			return HttpResponse.json({ error: "Not found" }, { status: 404 });
		}
		const detail: EMP201Detail = {
			...emp201,
			payruns: [
				{
					id: faker.string.uuid(),
					name: `Payrun - ${emp201.period}`,
					periodStart: faker.date.past().toISOString().split("T")[0],
					periodEnd: faker.date.recent().toISOString().split("T")[0],
					paye: emp201.totalPaye,
					uif: emp201.totalUif,
					sdl: emp201.totalSdl,
					employeeCount: emp201.totalEmployees,
				},
			],
			validation: {
				errors:
					emp201.status === "draft" ? [{ code: "E001", message: "Payroll not finalized", severity: "error" }] : [],
				warnings: [{ code: "W001", message: "Some employees missing tax numbers", severity: "warning" }],
			},
			auditLog: [
				{ id: "1", action: "Created", user: "System", timestamp: emp201.createdAt },
				...(emp201.submissionDate
					? [{ id: "2", action: "Submitted", user: emp201.submittedBy || "Admin", timestamp: emp201.submissionDate }]
					: []),
			],
		};
		return HttpResponse.json({ data: detail });
	}),

	// Submit EMP201
	http.post("/api/filings/emp201/:id/submit", async ({ params }) => {
		await delay(500);
		const emp201 = emp201List.find((e) => e.id === params.id);
		if (emp201) {
			emp201.status = "submitted";
			emp201.submissionDate = new Date().toISOString();
			emp201.submittedBy = "Current User";
		}
		return HttpResponse.json({ success: true });
	}),

	// UIF Declarations
	http.get("/api/filings/uif", async ({ request }) => {
		await delay(300);
		const url = new URL(request.url);
		const status = url.searchParams.get("status");
		const type = url.searchParams.get("type");
		let filtered = [...uifDeclarations];
		if (status && status !== "all") {
			filtered = filtered.filter((d) => d.status === status);
		}
		if (type && type !== "all") {
			filtered = filtered.filter((d) => d.declarationType === type);
		}
		return HttpResponse.json({ data: filtered });
	}),

	// EMP501 List
	http.get("/api/filings/emp501", async () => {
		await delay(300);
		const emp501List: EMP501[] = [
			{
				id: faker.string.uuid(),
				taxYear: "2025",
				type: "interim",
				status: "draft",
				payrollTotalPaye: 1200000,
				emp201TotalPaye: 1200000,
				variance: 0,
				employeeCount: 45,
				generatedAt: null,
				submittedAt: null,
			},
			{
				id: faker.string.uuid(),
				taxYear: "2024",
				type: "final",
				status: "accepted",
				payrollTotalPaye: 2400000,
				emp201TotalPaye: 2400000,
				variance: 0,
				employeeCount: 42,
				generatedAt: faker.date.past().toISOString(),
				submittedAt: faker.date.past().toISOString(),
			},
		];
		return HttpResponse.json({ data: emp501List });
	}),

	// EMP501 Detail
	http.get("/api/filings/emp501/:id", async ({ params }) => {
		await delay(300);
		const detail: EMP501Detail = {
			id: params.id as string,
			taxYear: "2025",
			type: "interim",
			status: "draft",
			payrollTotalPaye: 1200000,
			emp201TotalPaye: 1200000,
			variance: 0,
			employeeCount: 45,
			generatedAt: null,
			submittedAt: null,
			employees: Array.from({ length: 10 }, () => {
				const paye = faker.number.int({ min: 20000, max: 80000 });
				const variance = faker.datatype.boolean({ probability: 0.1 }) ? faker.number.int({ min: -500, max: 500 }) : 0;
				return {
					employeeId: faker.string.uuid(),
					employeeName: faker.person.fullName(),
					employeeNumber: `EMP${faker.string.numeric(4)}`,
					taxNumber: faker.string.numeric(10),
					payrollPaye: paye,
					emp201Paye: paye + variance,
					variance,
					hasMismatch: variance !== 0,
				};
			}),
			emp201Periods: emp201List.slice(0, 6).map((e) => ({
				period: e.period,
				paye: e.totalPaye,
				uif: e.totalUif,
				sdl: e.totalSdl,
			})),
			validation: {
				errors: [],
				warnings: [{ code: "W002", message: "2 employees have PAYE variances", severity: "warning" }],
			},
			auditLog: [{ id: "1", action: "Created", user: "System", timestamp: new Date().toISOString() }],
		};
		return HttpResponse.json({ data: detail });
	}),

	// Generate EMP501
	http.post("/api/filings/emp501/generate", async () => {
		await delay(800);
		return HttpResponse.json({ success: true, id: faker.string.uuid() });
	}),

	// IRP5 Certificates
	http.get("/api/filings/irp5", async ({ request }) => {
		await delay(300);
		const url = new URL(request.url);
		const taxYear = url.searchParams.get("taxYear");
		const status = url.searchParams.get("status");
		let filtered = [...irp5Certificates];
		if (taxYear) {
			filtered = filtered.filter((c) => c.taxYear === taxYear);
		}
		if (status && status !== "all") {
			filtered = filtered.filter((c) => c.status === status);
		}
		return HttpResponse.json({ data: filtered });
	}),

	// Generate IRP5 Certificates
	http.post("/api/filings/irp5/generate", async () => {
		await delay(1000);
		irp5Certificates.forEach((c) => {
			if (c.status === "draft") {
				c.status = "generated";
				c.generatedAt = new Date().toISOString();
			}
		});
		return HttpResponse.json({
			success: true,
			generated: irp5Certificates.filter((c) => c.status === "generated").length,
		});
	}),

	// Download filing
	http.get("/api/filings/:type/:id/download", async ({ params }) => {
		await delay(500);
		return HttpResponse.json({
			data: {
				id: faker.string.uuid(),
				filingType: params.type,
				filingId: params.id,
				fileName: `${params.type}_${params.id}.pdf`,
				format: "pdf",
				generatedAt: new Date().toISOString(),
				downloadUrl: "#",
			},
		});
	}),
];

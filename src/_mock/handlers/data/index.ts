import { faker } from "@faker-js/faker";
import { delay, HttpResponse, http } from "msw";
import type {
	DataOverview,
	ExportFormat,
	ExportJob,
	ExportType,
	ImportJob,
	ImportPreview,
	MigrationJob,
} from "@/types/data-operations";
import { EXPORT_TYPE_LABELS, IMPORT_TYPE_LABELS, MIGRATION_SOURCE_LABELS } from "@/types/data-operations";

const importJobs: ImportJob[] = [
	{
		id: "imp-1",
		type: "employees",
		typeLabel: IMPORT_TYPE_LABELS.employees,
		fileName: "employees_batch_jan.csv",
		fileSize: 45678,
		status: "completed",
		totalRows: 150,
		validRows: 148,
		errorRows: 2,
		warningRows: 5,
		uploadedBy: "John Admin",
		uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
		committedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 300000).toISOString(),
	},
	{
		id: "imp-2",
		type: "leave_balances",
		typeLabel: IMPORT_TYPE_LABELS.leave_balances,
		fileName: "leave_opening_balances.xlsx",
		fileSize: 23456,
		status: "completed",
		totalRows: 120,
		validRows: 120,
		errorRows: 0,
		warningRows: 3,
		uploadedBy: "Sarah HR",
		uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
		committedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 180000).toISOString(),
	},
	{
		id: "imp-3",
		type: "bank_details",
		typeLabel: IMPORT_TYPE_LABELS.bank_details,
		fileName: "bank_details_update.csv",
		fileSize: 12345,
		status: "failed",
		totalRows: 80,
		validRows: 65,
		errorRows: 15,
		warningRows: 0,
		uploadedBy: "Mike Payroll",
		uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
	},
];

const exportJobs: ExportJob[] = [
	{
		id: "exp-1",
		type: "employees",
		typeLabel: EXPORT_TYPE_LABELS.employees,
		format: "csv",
		status: "completed",
		requestedBy: "John Admin",
		requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
		completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
		downloadUrl: "/downloads/employees_export.csv",
		fileSize: 156789,
		recordCount: 245,
	},
	{
		id: "exp-2",
		type: "payroll_history",
		typeLabel: EXPORT_TYPE_LABELS.payroll_history,
		format: "excel",
		status: "completed",
		requestedBy: "Sarah HR",
		requestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
		completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 120000).toISOString(),
		downloadUrl: "/downloads/payroll_history.xlsx",
		fileSize: 2345678,
		recordCount: 1250,
		dateRange: {
			start: "2024-01-01",
			end: "2024-12-31",
		},
	},
	{
		id: "exp-3",
		type: "audit_logs",
		typeLabel: EXPORT_TYPE_LABELS.audit_logs,
		format: "csv",
		status: "processing",
		requestedBy: "Mike Payroll",
		requestedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
	},
];

const migrationJobs: MigrationJob[] = [
	{
		id: "mig-1",
		source: "simplepay",
		sourceLabel: MIGRATION_SOURCE_LABELS.simplepay,
		status: "completed",
		currentStep: 6,
		totalSteps: 6,
		stepLabel: "Completed",
		createdBy: "John Admin",
		createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
		completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
		employeesImported: 156,
		errorsCount: 3,
	},
];

export const dataHandlers = [
	// Overview
	http.get("/api/data/overview", async () => {
		await delay(200);
		const overview: DataOverview = {
			recentImports: importJobs.length,
			recentExports: exportJobs.length,
			migrationStatus: "idle",
			failedJobs: importJobs.filter((j) => j.status === "failed").length,
			lastImportAt: importJobs[0]?.uploadedAt,
			lastExportAt: exportJobs[0]?.requestedAt,
		};
		return HttpResponse.json({ status: "success", data: overview });
	}),

	// Import Jobs
	http.get("/api/data/imports", async ({ request }) => {
		await delay(200);
		const url = new URL(request.url);
		const limit = parseInt(url.searchParams.get("limit") || "50", 10);
		return HttpResponse.json({ status: "success", data: importJobs.slice(0, limit) });
	}),

	http.post("/api/data/imports/validate", async () => {
		await delay(500);
		const jobId = `imp-${Date.now()}`;
		return HttpResponse.json({
			status: "success",
			data: { jobId, message: "File validated successfully" },
		});
	}),

	http.get("/api/data/imports/preview", async ({ request }) => {
		await delay(300);
		const url = new URL(request.url);
		const jobId = url.searchParams.get("jobId");

		const preview: ImportPreview = {
			jobId: jobId || "imp-preview",
			type: "employees",
			typeLabel: IMPORT_TYPE_LABELS.employees,
			fileName: "employees_import.csv",
			totalRows: 25,
			validRows: 22,
			errorCount: 2,
			warningCount: 3,
			canCommit: true,
			validationResults: [
				{ row: 5, field: "id_number", value: "123456", severity: "error", message: "Invalid SA ID number format" },
				{ row: 12, field: "email", value: "invalid-email", severity: "error", message: "Invalid email format" },
				{
					row: 8,
					field: "phone",
					value: "0821234567",
					severity: "warning",
					message: "Phone number may be missing country code",
				},
				{
					row: 15,
					field: "start_date",
					value: "2020-01-01",
					severity: "warning",
					message: "Start date is more than 5 years ago",
				},
				{ row: 20, field: "salary", value: "0", severity: "warning", message: "Salary is zero - please verify" },
			],
			previewData: Array.from({ length: 10 }, (_, i) => ({
				employee_number: `EMP${String(i + 1).padStart(4, "0")}`,
				first_name: faker.person.firstName(),
				last_name: faker.person.lastName(),
				id_number: faker.string.numeric(13),
				email: faker.internet.email(),
				department: faker.commerce.department(),
				salary: faker.number.int({ min: 15000, max: 80000 }),
			})),
		};

		return HttpResponse.json({ status: "success", data: preview });
	}),

	http.post("/api/data/imports/commit", async () => {
		await delay(800);
		return HttpResponse.json({
			status: "success",
			data: { message: "Import committed successfully", recordsImported: 22 },
		});
	}),

	// Export Jobs
	http.get("/api/data/exports/history", async ({ request }) => {
		await delay(200);
		const url = new URL(request.url);
		const limit = parseInt(url.searchParams.get("limit") || "50", 10);
		return HttpResponse.json({ status: "success", data: exportJobs.slice(0, limit) });
	}),

	http.post("/api/data/exports", async ({ request }) => {
		await delay(400);
		const body = (await request.json()) as {
			type: ExportType;
			format: ExportFormat;
			dateRange?: { start: string; end: string };
		};

		const newExport: ExportJob = {
			id: `exp-${Date.now()}`,
			type: body.type,
			typeLabel: EXPORT_TYPE_LABELS[body.type],
			format: body.format,
			status: "completed",
			requestedBy: "Current User",
			requestedAt: new Date().toISOString(),
			completedAt: new Date().toISOString(),
			downloadUrl: `/downloads/${body.type}_export.${body.format}`,
			fileSize: faker.number.int({ min: 10000, max: 5000000 }),
			recordCount: faker.number.int({ min: 50, max: 500 }),
			dateRange: body.dateRange,
		};

		exportJobs.unshift(newExport);
		return HttpResponse.json({ status: "success", data: newExport });
	}),

	http.post("/api/data/exports/:id/regenerate", async ({ params }) => {
		await delay(300);
		const job = exportJobs.find((j) => j.id === params.id);
		if (!job) {
			return HttpResponse.json({ status: "error", message: "Export not found" }, { status: 404 });
		}
		return HttpResponse.json({ status: "success", message: "Export regeneration started" });
	}),

	// Migration Jobs
	http.get("/api/data/migration/jobs", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: migrationJobs });
	}),

	http.post("/api/data/migration/validate", async () => {
		await delay(600);
		return HttpResponse.json({
			status: "success",
			data: {
				valid: true,
				employeesFound: 156,
				leaveBalancesFound: 312,
				warnings: 5,
			},
		});
	}),

	http.post("/api/data/migration/commit", async ({ request }) => {
		await delay(1000);
		const body = (await request.json()) as { source: string };

		const newMigration: MigrationJob = {
			id: `mig-${Date.now()}`,
			source: body.source as MigrationJob["source"],
			sourceLabel: MIGRATION_SOURCE_LABELS[body.source as keyof typeof MIGRATION_SOURCE_LABELS],
			status: "completed",
			currentStep: 6,
			totalSteps: 6,
			stepLabel: "Completed",
			createdBy: "Current User",
			createdAt: new Date().toISOString(),
			completedAt: new Date().toISOString(),
			employeesImported: faker.number.int({ min: 50, max: 200 }),
			errorsCount: faker.number.int({ min: 0, max: 10 }),
		};

		migrationJobs.unshift(newMigration);
		return HttpResponse.json({ status: "success", data: newMigration });
	}),
];

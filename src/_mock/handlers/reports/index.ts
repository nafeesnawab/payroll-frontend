import { http, HttpResponse, delay } from "msw";

interface Report {
	id: string;
	name: string;
	category: string;
	description: string;
	lastGenerated?: string;
	format: string;
}

const reports: Report[] = [
	{
		id: "rpt-1",
		name: "Payroll Summary",
		category: "Payroll",
		description: "Monthly payroll summary with totals by department",
		lastGenerated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
		format: "pdf",
	},
	{
		id: "rpt-2",
		name: "Employee Cost Report",
		category: "Payroll",
		description: "Detailed breakdown of employee costs including benefits",
		lastGenerated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
		format: "excel",
	},
	{
		id: "rpt-3",
		name: "EMP201 Submission Report",
		category: "Statutory",
		description: "Monthly PAYE, UIF, and SDL submission details",
		lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
		format: "pdf",
	},
	{
		id: "rpt-4",
		name: "UIF Declaration",
		category: "Statutory",
		description: "UIF contribution declaration for submission",
		format: "pdf",
	},
	{
		id: "rpt-5",
		name: "Employee Master List",
		category: "Employee",
		description: "Complete list of all employees with key details",
		lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
		format: "excel",
	},
	{
		id: "rpt-6",
		name: "New Hires Report",
		category: "Employee",
		description: "Employees hired in the selected period",
		format: "excel",
	},
	{
		id: "rpt-7",
		name: "Terminations Report",
		category: "Employee",
		description: "Employees terminated in the selected period",
		format: "excel",
	},
	{
		id: "rpt-8",
		name: "Leave Balances",
		category: "Leave",
		description: "Current leave balances for all employees",
		lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
		format: "excel",
	},
	{
		id: "rpt-9",
		name: "Leave Taken Report",
		category: "Leave",
		description: "Leave taken by employees in the selected period",
		format: "excel",
	},
	{
		id: "rpt-10",
		name: "Payroll Journal",
		category: "Financial",
		description: "Accounting journal entries for payroll",
		lastGenerated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
		format: "excel",
	},
	{
		id: "rpt-11",
		name: "Bank File",
		category: "Financial",
		description: "EFT bank file for salary payments",
		format: "csv",
	},
];

export const reportHandlers = [
	http.get("/api/reports", async ({ request }) => {
		await delay(200);
		const url = new URL(request.url);
		const category = url.searchParams.get("category")?.toLowerCase();

		let filtered = [...reports];
		if (category) {
			filtered = filtered.filter((r) => r.category.toLowerCase() === category);
		}

		return HttpResponse.json({ status: "success", data: filtered });
	}),

	http.post("/api/reports/:id/generate", async ({ params }) => {
		await delay(500);
		const report = reports.find((r) => r.id === params.id);
		if (!report) {
			return HttpResponse.json({ status: "error", message: "Report not found" }, { status: 404 });
		}
		report.lastGenerated = new Date().toISOString();
		return HttpResponse.json({
			status: "success",
			data: { downloadUrl: `/downloads/${report.name.toLowerCase().replace(/\s+/g, "-")}.${report.format}` },
		});
	}),
];

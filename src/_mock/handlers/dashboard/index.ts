import { faker } from "@faker-js/faker";
import { delay, HttpResponse, http } from "msw";

export type ComplianceStatus = "draft" | "finalized" | "submitted" | "overdue" | "not_applicable";
export type AlertSeverity = "info" | "warning" | "critical";

const getCurrentPeriod = () => {
	const now = new Date();
	return `${now.toLocaleString("default", { month: "short" })} ${now.getFullYear()}`;
};

export const getComplianceStatus = http.get("/api/dashboard/compliance", async () => {
	await delay(300);

	return HttpResponse.json({
		status: "success",
		data: {
			emp201: {
				status: "draft",
				period: getCurrentPeriod(),
				total: faker.number.int({ min: 50000, max: 500000 }),
				dueDate: faker.date.soon({ days: 7 }).toISOString(),
			},
			uif: {
				status: "finalized",
				period: getCurrentPeriod(),
				total: faker.number.int({ min: 10000, max: 100000 }),
				dueDate: faker.date.soon({ days: 7 }).toISOString(),
			},
			bargainingCouncil: {
				status: "not_applicable",
				period: getCurrentPeriod(),
				total: 0,
				dueDate: null,
			},
		},
	});
});

export const getPayrollStatus = http.get("/api/dashboard/payroll-status", async () => {
	await delay(300);

	const totalEmployees = faker.number.int({ min: 10, max: 100 });
	const processedCount = faker.number.int({ min: 0, max: totalEmployees });
	const errors = faker.number.int({ min: 0, max: 5 });

	return HttpResponse.json({
		status: "success",
		data: {
			period: getCurrentPeriod(),
			frequency: "monthly",
			processedCount,
			totalEmployees,
			errors,
			netPay: faker.number.int({ min: 100000, max: 2000000 }),
			status: processedCount === totalEmployees && errors === 0 ? "ready" : "in_progress",
			payDate: faker.date.soon({ days: 5 }).toISOString(),
		},
	});
});

export const getWorkforceOverview = http.get("/api/dashboard/workforce", async () => {
	await delay(300);

	return HttpResponse.json({
		status: "success",
		data: {
			activeEmployees: faker.number.int({ min: 20, max: 150 }),
			newHires: faker.number.int({ min: 0, max: 5 }),
			terminations: faker.number.int({ min: 0, max: 3 }),
			employeesWithErrors: faker.number.int({ min: 0, max: 4 }),
			upcomingLeave: faker.number.int({ min: 0, max: 8 }),
			birthdays: [
				{ name: faker.person.fullName(), date: faker.date.soon({ days: 7 }).toISOString() },
				{ name: faker.person.fullName(), date: faker.date.soon({ days: 14 }).toISOString() },
			],
			anniversaries: [
				{
					name: faker.person.fullName(),
					years: faker.number.int({ min: 1, max: 10 }),
					date: faker.date.soon({ days: 7 }).toISOString(),
				},
			],
		},
	});
});

export const getNotifications = http.get("/api/dashboard/notifications", async () => {
	await delay(300);

	const notifications = [
		{
			id: faker.string.uuid(),
			type: "critical" as AlertSeverity,
			title: "EMP201 Due Soon",
			message: "Your EMP201 submission for the current period is due in 5 days",
			action: "/filings/emp201",
			createdAt: faker.date.recent().toISOString(),
			read: false,
		},
		{
			id: faker.string.uuid(),
			type: "warning" as AlertSeverity,
			title: "Missing Employee Data",
			message: "3 employees have incomplete tax information",
			action: "/employees?filter=errors",
			createdAt: faker.date.recent().toISOString(),
			read: false,
		},
		{
			id: faker.string.uuid(),
			type: "info" as AlertSeverity,
			title: "Payroll Ready",
			message: "All employees have been processed for the current period",
			action: "/payroll",
			createdAt: faker.date.recent().toISOString(),
			read: true,
		},
	];

	return HttpResponse.json({
		status: "success",
		data: notifications,
	});
});

export const getSetupProgress = http.get("/api/dashboard/setup-progress", async () => {
	await delay(200);

	return HttpResponse.json({
		status: "success",
		data: {
			employerDetailsComplete: true,
			bankDetailsComplete: false,
			employeesAdded: true,
			firstPayrollRun: false,
			completionPercentage: 50,
			steps: [
				{ key: "employer", label: "Employer Details", complete: true, route: "/settings/employer" },
				{ key: "bank", label: "Bank & EFT Setup", complete: false, route: "/settings/bank" },
				{ key: "employees", label: "Add Employees", complete: true, route: "/employees" },
				{ key: "payroll", label: "Run First Payroll", complete: false, route: "/payroll" },
			],
		},
	});
});

export const dashboardHandlers = [
	getComplianceStatus,
	getPayrollStatus,
	getWorkforceOverview,
	getNotifications,
	getSetupProgress,
];

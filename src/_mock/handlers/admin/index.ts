import { faker } from "@faker-js/faker";
import { delay, HttpResponse, http } from "msw";
import type {
	AdminUser,
	BackgroundJob,
	CompanyBilling,
	FeatureFlag,
	PlatformCompany,
	PlatformOverview,
	RecentActivity,
	SystemSettings,
} from "@/types/admin";

const adminUsers: AdminUser[] = [
	{
		id: "admin-1",
		name: "John Super",
		email: "john@paypilot.co.za",
		role: "super_admin",
		status: "active",
		lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
		createdAt: "2023-01-15T00:00:00Z",
	},
	{
		id: "admin-2",
		name: "Sarah Support",
		email: "sarah@paypilot.co.za",
		role: "support_agent",
		status: "active",
		lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
		createdAt: "2023-06-20T00:00:00Z",
	},
	{
		id: "admin-3",
		name: "Mike Auditor",
		email: "mike@paypilot.co.za",
		role: "auditor",
		status: "active",
		lastLogin: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
		createdAt: "2024-01-10T00:00:00Z",
	},
];

const systemSettings: SystemSettings = {
	payroll: {
		defaultTaxYear: "2025",
		calculationPrecision: 2,
		roundingRule: "round",
	},
	compliance: {
		defaultPayeRate: 25,
		defaultUifRate: 1,
		defaultSdlRate: 1,
		filingWindowDays: 7,
	},
	security: {
		minPasswordLength: 8,
		require2FA: false,
		sessionTimeoutMinutes: 60,
		maxLoginAttempts: 5,
	},
	performance: {
		maxBackgroundJobs: 10,
		maxFileUploadMB: 25,
		maxImportRows: 10000,
	},
};

const platformCompanies: PlatformCompany[] = Array.from({ length: 20 }, (_, i) => ({
	id: `company-${i + 1}`,
	name: faker.company.name(),
	registrationNumber: `202${i}/123456/07`,
	payeReference: `7${String(i + 1).padStart(9, "0")}`,
	subscriptionPlan: ["starter", "professional", "enterprise"][i % 3] as PlatformCompany["subscriptionPlan"],
	billingStatus: ["active", "active", "active", "overdue"][i % 4] as PlatformCompany["billingStatus"],
	employeeCount: faker.number.int({ min: 5, max: 500 }),
	lastPayrollDate: new Date(Date.now() - (i * 2 + 1) * 24 * 60 * 60 * 1000).toISOString(),
	createdAt: new Date(Date.now() - (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
	status: i === 5 ? "suspended" : "active",
}));

const backgroundJobs: BackgroundJob[] = [
	{
		id: "job-1",
		type: "payroll_calculation",
		typeLabel: "Payroll Calculation",
		companyName: "Acme Corp",
		status: "running",
		progress: 65,
		startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
		retryCount: 0,
	},
	{
		id: "job-2",
		type: "import",
		typeLabel: "Data Import",
		companyName: "Tech Solutions",
		status: "pending",
		progress: 0,
		startedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
		retryCount: 0,
	},
	{
		id: "job-3",
		type: "export",
		typeLabel: "Data Export",
		companyName: "Global Services",
		status: "completed",
		progress: 100,
		startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
		completedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
		retryCount: 0,
	},
	{
		id: "job-4",
		type: "filing",
		typeLabel: "Statutory Filing",
		companyName: "Finance Plus",
		status: "failed",
		progress: 45,
		startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
		errorMessage: "SARS connection timeout",
		retryCount: 2,
	},
];

const featureFlags: FeatureFlag[] = [
	{
		id: "feature-1",
		name: "New Payslip Design",
		description: "Modern payslip layout with enhanced readability",
		status: "beta",
		scope: "company",
		rolloutPercentage: 25,
		updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
		updatedBy: "John Super",
	},
	{
		id: "feature-2",
		name: "AI Leave Suggestions",
		description: "AI-powered leave date recommendations",
		status: "off",
		scope: "global",
		rolloutPercentage: 0,
		updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
		updatedBy: "John Super",
	},
	{
		id: "feature-3",
		name: "Bulk Payroll Actions",
		description: "Process multiple payrolls simultaneously",
		status: "on",
		scope: "global",
		rolloutPercentage: 100,
		updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
		updatedBy: "Sarah Support",
	},
	{
		id: "feature-4",
		name: "Advanced Reporting",
		description: "Enhanced analytics and custom report builder",
		status: "beta",
		scope: "group",
		rolloutPercentage: 50,
		updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
		updatedBy: "John Super",
	},
];

const companyBillings: CompanyBilling[] = platformCompanies.slice(0, 10).map((c) => ({
	companyId: c.id,
	companyName: c.name,
	plan: c.subscriptionPlan,
	billingCycle: Math.random() > 0.3 ? "monthly" : "annual",
	monthlyAmount: c.subscriptionPlan === "enterprise" ? 2500 : c.subscriptionPlan === "professional" ? 1500 : 500,
	employeeCount: c.employeeCount,
	usageMetrics: {
		payrollRuns: faker.number.int({ min: 1, max: 12 }),
		employees: c.employeeCount,
		storageUsedMB: faker.number.int({ min: 50, max: 500 }),
	},
	status: c.billingStatus,
	nextBillingDate: new Date(Date.now() + faker.number.int({ min: 1, max: 30 }) * 24 * 60 * 60 * 1000).toISOString(),
	discountPercent: Math.random() > 0.7 ? faker.number.int({ min: 5, max: 20 }) : 0,
}));

export const adminHandlers = [
	// Platform Overview
	http.get("/api/admin/overview", async () => {
		await delay(200);
		const overview: PlatformOverview = {
			activeCompanies: platformCompanies.filter((c) => c.status === "active").length,
			activeEmployees: platformCompanies.reduce((sum, c) => sum + c.employeeCount, 0),
			payrollsProcessedThisMonth: 156,
			errorRate: 0.8,
			newSignupsThisWeek: 5,
			failedPayrollRuns: 3,
			systemAlerts: 2,
		};
		return HttpResponse.json({ status: "success", data: overview });
	}),

	// Recent Activity
	http.get("/api/admin/activity", async () => {
		await delay(200);
		const activities: RecentActivity[] = [
			{
				id: "act-1",
				type: "signup",
				description: "New company registered",
				companyName: "Fresh Start Ltd",
				timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
				severity: "info",
			},
			{
				id: "act-2",
				type: "payroll_failed",
				description: "Payroll calculation failed",
				companyName: "Tech Solutions",
				timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
				severity: "error",
			},
			{
				id: "act-3",
				type: "system_alert",
				description: "High API latency detected",
				timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
				severity: "warning",
			},
		];
		return HttpResponse.json({ status: "success", data: activities });
	}),

	// System Settings
	http.get("/api/admin/settings", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: systemSettings });
	}),

	http.put("/api/admin/settings", async ({ request }) => {
		await delay(300);
		const body = (await request.json()) as SystemSettings;
		Object.assign(systemSettings, body);
		return HttpResponse.json({ status: "success", data: systemSettings });
	}),

	// Admin Users
	http.get("/api/admin/users", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: adminUsers });
	}),

	http.post("/api/admin/users", async ({ request }) => {
		await delay(300);
		const body = (await request.json()) as { name: string; email: string; role: AdminUser["role"] };
		const newUser: AdminUser = {
			id: `admin-${Date.now()}`,
			name: body.name,
			email: body.email,
			role: body.role,
			status: "pending",
			createdAt: new Date().toISOString(),
		};
		adminUsers.push(newUser);
		return HttpResponse.json({ status: "success", data: newUser });
	}),

	http.put("/api/admin/users/:id", async ({ params, request }) => {
		await delay(200);
		const body = (await request.json()) as Partial<AdminUser>;
		const index = adminUsers.findIndex((u) => u.id === params.id);
		if (index !== -1) {
			adminUsers[index] = { ...adminUsers[index], ...body };
		}
		return HttpResponse.json({ status: "success", data: adminUsers[index] });
	}),

	http.post("/api/admin/users/:id/reset", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", message: "Password reset email sent" });
	}),

	// Companies
	http.get("/api/admin/companies", async ({ request }) => {
		await delay(200);
		const url = new URL(request.url);
		const search = url.searchParams.get("search")?.toLowerCase() || "";

		const filtered = search
			? platformCompanies.filter(
					(c) =>
						c.name.toLowerCase().includes(search) ||
						c.registrationNumber.includes(search) ||
						c.payeReference.includes(search),
				)
			: platformCompanies;

		return HttpResponse.json({ status: "success", data: filtered });
	}),

	http.put("/api/admin/companies/:id", async ({ params, request }) => {
		await delay(200);
		const body = (await request.json()) as Partial<PlatformCompany>;
		const index = platformCompanies.findIndex((c) => c.id === params.id);
		if (index !== -1) {
			platformCompanies[index] = { ...platformCompanies[index], ...body };
		}
		return HttpResponse.json({ status: "success", data: platformCompanies[index] });
	}),

	// Background Jobs
	http.get("/api/admin/jobs", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: backgroundJobs });
	}),

	http.post("/api/admin/jobs/:id/retry", async ({ params }) => {
		await delay(300);
		const job = backgroundJobs.find((j) => j.id === params.id);
		if (job) {
			job.status = "pending";
			job.retryCount += 1;
		}
		return HttpResponse.json({ status: "success", message: "Job retry initiated" });
	}),

	http.post("/api/admin/jobs/:id/cancel", async ({ params }) => {
		await delay(200);
		const job = backgroundJobs.find((j) => j.id === params.id);
		if (job) {
			job.status = "cancelled";
		}
		return HttpResponse.json({ status: "success", message: "Job cancelled" });
	}),

	// Feature Flags
	http.get("/api/admin/features", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: featureFlags });
	}),

	http.put("/api/admin/features", async ({ request }) => {
		await delay(300);
		const body = (await request.json()) as { features: FeatureFlag[] };
		body.features.forEach((updated) => {
			const index = featureFlags.findIndex((f) => f.id === updated.id);
			if (index !== -1) {
				featureFlags[index] = { ...updated, updatedAt: new Date().toISOString() };
			}
		});
		return HttpResponse.json({ status: "success", data: featureFlags });
	}),

	// Billing
	http.get("/api/admin/billing", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: companyBillings });
	}),

	http.put("/api/admin/billing/:companyId", async ({ params, request }) => {
		await delay(300);
		const body = (await request.json()) as { action: string };
		const billing = companyBillings.find((b) => b.companyId === params.companyId);
		if (billing) {
			if (body.action === "suspend") {
				billing.status = "suspended";
			} else if (body.action === "reactivate") {
				billing.status = "active";
			} else if (body.action === "discount") {
				billing.discountPercent = 10;
			}
		}
		return HttpResponse.json({ status: "success", data: billing });
	}),

	// Admin Audit Logs
	http.get("/api/admin/audit-logs", async ({ request }) => {
		await delay(200);
		const url = new URL(request.url);
		const category = url.searchParams.get("category");
		const search = url.searchParams.get("search")?.toLowerCase();

		const auditLogs = [
			{
				id: "log-1",
				action: "Logged in",
				category: "login",
				userId: "admin-1",
				userName: "John Super",
				details: "Successful login from Chrome on macOS",
				ipAddress: "192.168.1.100",
				timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
			},
			{
				id: "log-2",
				action: "Updated system settings",
				category: "settings",
				userId: "admin-1",
				userName: "John Super",
				targetId: "settings",
				targetName: "Security Settings",
				details: "Changed session timeout from 30 to 60 minutes",
				ipAddress: "192.168.1.100",
				timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
			},
			{
				id: "log-3",
				action: "Impersonated user",
				category: "impersonation",
				userId: "admin-2",
				userName: "Sarah Support",
				targetId: "user-123",
				targetName: "client@example.com",
				details: "Started impersonation session",
				ipAddress: "192.168.1.101",
				timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
			},
			{
				id: "log-4",
				action: "Suspended company",
				category: "suspension",
				userId: "admin-1",
				userName: "John Super",
				targetId: "company-5",
				targetName: "Acme Corp",
				details: "Suspended due to payment issues",
				ipAddress: "192.168.1.100",
				timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
			},
			{
				id: "log-5",
				action: "Toggled feature flag",
				category: "feature_toggle",
				userId: "admin-1",
				userName: "John Super",
				targetId: "feature-1",
				targetName: "New Payslip Design",
				details: "Changed status from off to beta",
				ipAddress: "192.168.1.100",
				timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
			},
			{
				id: "log-6",
				action: "Applied discount",
				category: "billing",
				userId: "admin-2",
				userName: "Sarah Support",
				targetId: "company-3",
				targetName: "Tech Solutions",
				details: "Applied 10% discount",
				ipAddress: "192.168.1.101",
				timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
			},
		];

		let filtered = [...auditLogs];
		if (category) {
			filtered = filtered.filter((l) => l.category === category);
		}
		if (search) {
			filtered = filtered.filter(
				(l) =>
					l.userName.toLowerCase().includes(search) ||
					l.action.toLowerCase().includes(search) ||
					l.targetName?.toLowerCase().includes(search),
			);
		}

		return HttpResponse.json({ status: "success", data: filtered });
	}),
];

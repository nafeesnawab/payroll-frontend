import { faker } from "@faker-js/faker";
import { http, HttpResponse, delay } from "msw";
import type {
	Role,
	SystemUser,
	AccessOverview,
	Permission,
	AuditLog,
	AuditLogDetail,
	ModuleName,
	AuditActionType,
} from "@/types/access";
import { HIGH_RISK_ACTIONS } from "@/types/access";

const systemRoles: Role[] = [
	{
		id: "role-1",
		name: "Owner",
		description: "Full access to all features and settings",
		isSystemRole: true,
		userCount: 1,
		permissions: [
			{ module: "dashboard", actions: ["view"] },
			{ module: "employees", actions: ["view", "create", "edit", "delete"] },
			{ module: "payroll", actions: ["view", "create", "edit", "finalize", "delete"] },
			{ module: "leave", actions: ["view", "create", "edit", "delete"] },
			{ module: "filings", actions: ["view", "create", "edit", "submit"] },
			{ module: "terminations", actions: ["view", "create", "edit", "finalize"] },
			{ module: "settings", actions: ["view", "edit"] },
			{ module: "access", actions: ["view", "create", "edit", "delete"] },
			{ module: "audit", actions: ["view"] },
		],
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "role-2",
		name: "Super Admin",
		description: "Administrative access with some restrictions",
		isSystemRole: true,
		userCount: 2,
		permissions: [
			{ module: "dashboard", actions: ["view"] },
			{ module: "employees", actions: ["view", "create", "edit", "delete"] },
			{ module: "payroll", actions: ["view", "create", "edit", "finalize"] },
			{ module: "leave", actions: ["view", "create", "edit", "delete"] },
			{ module: "filings", actions: ["view", "create", "edit", "submit"] },
			{ module: "terminations", actions: ["view", "create", "edit", "finalize"] },
			{ module: "settings", actions: ["view", "edit"] },
			{ module: "access", actions: ["view", "create", "edit"] },
			{ module: "audit", actions: ["view"] },
		],
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "role-3",
		name: "Payroll Admin",
		description: "Manage payroll processing and employee compensation",
		isSystemRole: true,
		userCount: 3,
		permissions: [
			{ module: "dashboard", actions: ["view"] },
			{ module: "employees", actions: ["view", "edit"] },
			{ module: "payroll", actions: ["view", "create", "edit", "finalize"] },
			{ module: "leave", actions: ["view"] },
			{ module: "filings", actions: ["view", "create", "submit"] },
			{ module: "terminations", actions: ["view", "create", "edit", "finalize"] },
		],
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "role-4",
		name: "HR Admin",
		description: "Manage employees and leave",
		isSystemRole: true,
		userCount: 2,
		permissions: [
			{ module: "dashboard", actions: ["view"] },
			{ module: "employees", actions: ["view", "create", "edit", "delete"] },
			{ module: "leave", actions: ["view", "create", "edit", "delete"] },
			{ module: "terminations", actions: ["view", "create", "edit"] },
		],
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "role-5",
		name: "Manager",
		description: "View reports and approve leave requests",
		isSystemRole: true,
		userCount: 5,
		permissions: [
			{ module: "dashboard", actions: ["view"] },
			{ module: "employees", actions: ["view"] },
			{ module: "leave", actions: ["view", "edit"] },
		],
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "role-6",
		name: "Employee",
		description: "Employee self-service access only",
		isSystemRole: true,
		userCount: 50,
		permissions: [{ module: "ess", actions: ["view"] }],
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
	},
];

const customRoles: Role[] = [
	{
		id: "role-7",
		name: "Payroll Viewer",
		description: "Read-only access to payroll data",
		isSystemRole: false,
		userCount: 0,
		permissions: [
			{ module: "dashboard", actions: ["view"] },
			{ module: "payroll", actions: ["view"] },
		],
		createdAt: "2025-06-15T10:00:00Z",
		updatedAt: "2025-06-15T10:00:00Z",
	},
];

const roles = [...systemRoles, ...customRoles];

const users: SystemUser[] = [
	{
		id: "user-1",
		firstName: "John",
		lastName: "Owner",
		email: "john.owner@company.com",
		status: "active",
		roles: ["role-1"],
		roleNames: ["Owner"],
		companyAccess: "all",
		lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
		createdAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "user-2",
		firstName: "Sarah",
		lastName: "Admin",
		email: "sarah.admin@company.com",
		status: "active",
		roles: ["role-2"],
		roleNames: ["Super Admin"],
		companyAccess: "all",
		lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
		createdAt: "2024-02-15T00:00:00Z",
	},
	{
		id: "user-3",
		firstName: "Mike",
		lastName: "Payroll",
		email: "mike.payroll@company.com",
		status: "active",
		roles: ["role-3"],
		roleNames: ["Payroll Admin"],
		companyAccess: "all",
		lastLoginAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
		createdAt: "2024-03-10T00:00:00Z",
	},
	{
		id: "user-4",
		firstName: "Lisa",
		lastName: "HR",
		email: "lisa.hr@company.com",
		status: "active",
		roles: ["role-4"],
		roleNames: ["HR Admin"],
		companyAccess: "specific",
		companyIds: ["company-1"],
		lastLoginAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
		createdAt: "2024-04-20T00:00:00Z",
	},
	{
		id: "user-5",
		firstName: "Tom",
		lastName: "Manager",
		email: "tom.manager@company.com",
		status: "active",
		roles: ["role-5"],
		roleNames: ["Manager"],
		companyAccess: "all",
		lastLoginAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
		createdAt: "2024-05-01T00:00:00Z",
	},
	{
		id: "user-6",
		firstName: "New",
		lastName: "User",
		email: "new.user@company.com",
		status: "invited",
		roles: ["role-5"],
		roleNames: ["Manager"],
		companyAccess: "all",
		invitedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
		createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
	},
	{
		id: "user-7",
		firstName: "Suspended",
		lastName: "User",
		email: "suspended@company.com",
		status: "suspended",
		roles: ["role-3"],
		roleNames: ["Payroll Admin"],
		companyAccess: "all",
		lastLoginAt: "2025-01-01T00:00:00Z",
		createdAt: "2024-06-01T00:00:00Z",
	},
];

const actionLabels: Record<AuditActionType, string> = {
	login: "User Login",
	logout: "User Logout",
	payroll_create: "Payroll Created",
	payroll_edit: "Payroll Edited",
	payroll_finalize: "Payroll Finalized",
	payroll_delete: "Payroll Deleted",
	filing_submit: "Filing Submitted",
	filing_edit: "Filing Edited",
	termination_create: "Termination Created",
	termination_finalize: "Termination Finalized",
	leave_approve: "Leave Approved",
	leave_reject: "Leave Rejected",
	role_create: "Role Created",
	role_edit: "Role Edited",
	role_delete: "Role Deleted",
	user_invite: "User Invited",
	user_update: "User Updated",
	user_suspend: "User Suspended",
	user_delete: "User Deleted",
	permission_change: "Permissions Changed",
	settings_update: "Settings Updated",
	employee_create: "Employee Created",
	employee_edit: "Employee Edited",
	employee_delete: "Employee Deleted",
};

const generateAuditLogs = (): AuditLog[] => {
	const actions: AuditActionType[] = [
		"login",
		"payroll_create",
		"payroll_finalize",
		"leave_approve",
		"employee_edit",
		"filing_submit",
		"user_invite",
		"settings_update",
		"termination_create",
		"role_edit",
	];
	const modules: ModuleName[] = [
		"access",
		"payroll",
		"payroll",
		"leave",
		"employees",
		"filings",
		"access",
		"settings",
		"terminations",
		"access",
	];

	return Array.from({ length: 50 }, (_, i) => {
		const actionIndex = i % actions.length;
		const action = actions[actionIndex];
		const module = modules[actionIndex];
		const user = users[i % users.length];
		const timestamp = new Date(Date.now() - i * 3600000 * 4);

		return {
			id: `log-${i + 1}`,
			timestamp: timestamp.toISOString(),
			userId: user.id,
			userName: `${user.firstName} ${user.lastName}`,
			userEmail: user.email,
			action,
			actionLabel: actionLabels[action],
			module,
			entityType: module.charAt(0).toUpperCase() + module.slice(1),
			entityId: `entity-${i + 1}`,
			entityName: faker.company.name(),
			ipAddress: faker.internet.ip(),
			userAgent: faker.internet.userAgent(),
			isHighRisk: HIGH_RISK_ACTIONS.includes(action),
		};
	});
};

const auditLogs = generateAuditLogs();

export const accessHandlers = [
	// Access Overview
	http.get("/api/access/overview", async () => {
		await delay(300);
		const activeUsers = users.filter((u) => u.status === "active").length;
		const invitedUsers = users.filter((u) => u.status === "invited").length;
		const suspendedUsers = users.filter((u) => u.status === "suspended").length;
		const adminRoles = ["role-1", "role-2", "role-3"];
		const usersWithAdminAccess = users.filter((u) =>
			u.roles.some((r) => adminRoles.includes(r))
		).length;

		const recentHighRisk = auditLogs
			.filter((l) => l.isHighRisk)
			.slice(0, 5)
			.map((l) => ({
				id: l.id,
				action: l.actionLabel,
				user: l.userName,
				timestamp: l.timestamp,
			}));

		const overview: AccessOverview = {
			totalUsers: users.length,
			activeUsers,
			invitedUsers,
			suspendedUsers,
			totalRoles: roles.length,
			usersWithAdminAccess,
			recentHighRiskActions: recentHighRisk,
		};

		return HttpResponse.json({ status: "success", data: overview });
	}),

	// Roles
	http.get("/api/access/roles", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: roles });
	}),

	http.get("/api/access/roles/:id", async ({ params }) => {
		await delay(200);
		const role = roles.find((r) => r.id === params.id);
		if (!role) {
			return HttpResponse.json({ status: "error", message: "Role not found" }, { status: 404 });
		}
		return HttpResponse.json({ status: "success", data: role });
	}),

	http.post("/api/access/roles", async ({ request }) => {
		await delay(300);
		const body = (await request.json()) as { name: string; description: string; permissions: Permission[] };
		const newRole: Role = {
			id: `role-${roles.length + 1}`,
			name: body.name,
			description: body.description,
			isSystemRole: false,
			userCount: 0,
			permissions: body.permissions || [],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		roles.push(newRole);
		return HttpResponse.json({ status: "success", data: newRole });
	}),

	http.put("/api/access/roles/:id", async ({ params, request }) => {
		await delay(300);
		const body = (await request.json()) as Partial<Role>;
		const roleIndex = roles.findIndex((r) => r.id === params.id);
		if (roleIndex === -1) {
			return HttpResponse.json({ status: "error", message: "Role not found" }, { status: 404 });
		}
		roles[roleIndex] = {
			...roles[roleIndex],
			...body,
			updatedAt: new Date().toISOString(),
		};
		return HttpResponse.json({ status: "success", data: roles[roleIndex] });
	}),

	http.delete("/api/access/roles/:id", async ({ params }) => {
		await delay(300);
		const roleIndex = roles.findIndex((r) => r.id === params.id);
		if (roleIndex === -1) {
			return HttpResponse.json({ status: "error", message: "Role not found" }, { status: 404 });
		}
		const role = roles[roleIndex];
		if (role.isSystemRole) {
			return HttpResponse.json(
				{ status: "error", message: "Cannot delete system role" },
				{ status: 400 }
			);
		}
		if (role.userCount > 0) {
			return HttpResponse.json(
				{ status: "error", message: "Cannot delete role with assigned users" },
				{ status: 400 }
			);
		}
		roles.splice(roleIndex, 1);
		return HttpResponse.json({ status: "success" });
	}),

	// Users
	http.get("/api/access/users", async () => {
		await delay(300);
		return HttpResponse.json({ status: "success", data: users });
	}),

	http.get("/api/access/users/:id", async ({ params }) => {
		await delay(200);
		const user = users.find((u) => u.id === params.id);
		if (!user) {
			return HttpResponse.json({ status: "error", message: "User not found" }, { status: 404 });
		}
		return HttpResponse.json({ status: "success", data: user });
	}),

	http.post("/api/access/users/invite", async ({ request }) => {
		await delay(400);
		const body = (await request.json()) as {
			email: string;
			firstName: string;
			lastName: string;
			roleIds: string[];
			companyAccess: "all" | "specific";
		};
		const roleNames = body.roleIds
			.map((id) => roles.find((r) => r.id === id)?.name)
			.filter(Boolean) as string[];

		const newUser: SystemUser = {
			id: `user-${users.length + 1}`,
			firstName: body.firstName,
			lastName: body.lastName,
			email: body.email,
			status: "invited",
			roles: body.roleIds,
			roleNames,
			companyAccess: body.companyAccess,
			invitedAt: new Date().toISOString(),
			createdAt: new Date().toISOString(),
		};
		users.push(newUser);
		return HttpResponse.json({ status: "success", data: newUser });
	}),

	http.put("/api/access/users/:id", async ({ params, request }) => {
		await delay(300);
		const body = (await request.json()) as Partial<SystemUser> & { roleIds?: string[] };
		const userIndex = users.findIndex((u) => u.id === params.id);
		if (userIndex === -1) {
			return HttpResponse.json({ status: "error", message: "User not found" }, { status: 404 });
		}

		if (body.roleIds) {
			const roleNames = body.roleIds
				.map((id) => roles.find((r) => r.id === id)?.name)
				.filter(Boolean) as string[];
			users[userIndex].roles = body.roleIds;
			users[userIndex].roleNames = roleNames;
		}

		if (body.status) {
			users[userIndex].status = body.status;
		}

		if (body.companyAccess) {
			users[userIndex].companyAccess = body.companyAccess;
		}

		return HttpResponse.json({ status: "success", data: users[userIndex] });
	}),

	http.delete("/api/access/users/:id", async ({ params }) => {
		await delay(300);
		const userIndex = users.findIndex((u) => u.id === params.id);
		if (userIndex === -1) {
			return HttpResponse.json({ status: "error", message: "User not found" }, { status: 404 });
		}
		users.splice(userIndex, 1);
		return HttpResponse.json({ status: "success" });
	}),

	// Audit Logs
	http.get("/api/audit-logs", async ({ request }) => {
		await delay(300);
		const url = new URL(request.url);
		const startDate = url.searchParams.get("startDate");
		const endDate = url.searchParams.get("endDate");
		const module = url.searchParams.get("module") as ModuleName | null;
		const userId = url.searchParams.get("userId");
		const isHighRisk = url.searchParams.get("isHighRisk") === "true";
		const limit = parseInt(url.searchParams.get("limit") || "50", 10);

		let filtered = [...auditLogs];

		if (startDate) {
			filtered = filtered.filter((l) => new Date(l.timestamp) >= new Date(startDate));
		}
		if (endDate) {
			filtered = filtered.filter((l) => new Date(l.timestamp) <= new Date(endDate));
		}
		if (module) {
			filtered = filtered.filter((l) => l.module === module);
		}
		if (userId) {
			filtered = filtered.filter((l) => l.userId === userId);
		}
		if (isHighRisk) {
			filtered = filtered.filter((l) => l.isHighRisk);
		}

		return HttpResponse.json({ status: "success", data: filtered.slice(0, limit) });
	}),

	http.get("/api/audit-logs/:id", async ({ params }) => {
		await delay(200);
		const log = auditLogs.find((l) => l.id === params.id);
		if (!log) {
			return HttpResponse.json({ status: "error", message: "Log not found" }, { status: 404 });
		}

		const detail: AuditLogDetail = {
			...log,
			beforeData: {
				status: "draft",
				amount: 25000,
			},
			afterData: {
				status: "finalized",
				amount: 25000,
			},
			metadata: {
				browser: "Chrome 120",
				os: "macOS 14.2",
				sessionId: faker.string.uuid(),
			},
		};

		return HttpResponse.json({ status: "success", data: detail });
	}),
];

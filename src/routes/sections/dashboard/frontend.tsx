import type { RouteObject } from "react-router";
import { Navigate } from "react-router";
import { Component } from "./utils";

export function getFrontendDashboardRoutes(): RouteObject[] {
	const frontendDashboardRoutes: RouteObject[] = [
		// Dashboard
		{ path: "dashboard", element: Component("/pages/dashboard") },

		// Settings & Employer Configuration
		{
			path: "settings",
			element: Component("/pages/settings/layout"),
			children: [
				{ index: true, element: <Navigate to="employer" replace /> },
				{ path: "employer", element: Component("/pages/settings/employer") },
				{ path: "banking", element: Component("/pages/settings/banking") },
				{ path: "pay-frequencies", element: Component("/pages/settings/pay-frequencies") },
				{ path: "pay-points", element: Component("/pages/settings/pay-points") },
				{ path: "job-grades", element: Component("/pages/settings/job-grades") },
				{ path: "leave", element: Component("/pages/settings/leave") },
				{ path: "payroll-items", element: Component("/pages/settings/payroll-items") },
				{ path: "salary-rules", element: Component("/pages/settings/salary-rules") },
				{ path: "payslips", element: Component("/pages/settings/payslips") },
				{ path: "employee-numbers", element: Component("/pages/settings/employee-numbers") },
				{ path: "beneficiaries", element: Component("/pages/settings/beneficiaries") },
				{ path: "notifications", element: Component("/pages/settings/notifications") },
				{ path: "users", element: Component("/pages/settings/users") },
			],
		},

		// Employee Management
		{ path: "employees", element: Component("/pages/employees") },
		{ path: "employees/new", element: Component("/pages/employees/new") },
		{ path: "employees/:id", element: Component("/pages/employees/profile") },

		// Payroll Processing
		{ path: "payroll", element: Component("/pages/payroll") },
		{ path: "payroll/new", element: Component("/pages/payroll/new") },
		{ path: "payroll/:id", element: Component("/pages/payroll/detail") },
		{ path: "payroll/:id/payslip/:employeeId", element: Component("/pages/payroll/payslip") },

		// Leave Management
		{ path: "leave", element: Component("/pages/leave") },
		{ path: "leave/requests", element: Component("/pages/leave/requests") },
		{ path: "leave/balances", element: Component("/pages/leave/balances") },
		{ path: "leave/calendar", element: Component("/pages/leave/calendar") },
		{ path: "leave/settings", element: Component("/pages/leave/settings") },
		{ path: "leave/request/new", element: Component("/pages/leave/request/new") },
		{ path: "leave/my-leave", element: Component("/pages/leave/my-leave") },

		// Terminations & Offboarding
		{ path: "terminations", element: Component("/pages/terminations") },
		{ path: "terminations/new", element: Component("/pages/terminations/new") },
		{ path: "terminations/:id", element: Component("/pages/terminations/detail") },

		// Statutory Filings
		{ path: "filings", element: Component("/pages/filings") },
		{ path: "filings/emp201", element: Component("/pages/filings/emp201") },
		{ path: "filings/emp201/:id", element: Component("/pages/filings/emp201/detail") },
		{ path: "filings/emp501", element: Component("/pages/filings/emp501") },
		{ path: "filings/uif", element: Component("/pages/filings/uif") },
		{ path: "filings/irp5", element: Component("/pages/filings/irp5") },

		// Reports & Compliance
		{ path: "reports", element: Component("/pages/reports") },

		// Access Control
		{ path: "access", element: Component("/pages/access") },
		{ path: "access/roles", element: Component("/pages/access/roles") },
		{ path: "access/roles/:id", element: Component("/pages/access/roles/detail") },
		{ path: "access/users", element: Component("/pages/access/users") },
		{ path: "access/users/:id", element: Component("/pages/access/users/detail") },

		// Audit Logs
		{ path: "audit-logs", element: Component("/pages/audit-logs") },
		{ path: "audit-logs/:id", element: Component("/pages/audit-logs/detail") },

		// Notifications
		{ path: "notifications", element: Component("/pages/notifications") },
		{ path: "notifications/settings", element: Component("/pages/notifications/settings") },
		{ path: "notifications/preferences", element: Component("/pages/notifications/preferences") },
		{ path: "notifications/logs", element: Component("/pages/notifications/logs") },

		// Automation
		{ path: "automation", element: Component("/pages/automation") },
		{ path: "automation/:id", element: Component("/pages/automation/detail") },

		// Data Operations
		{ path: "data", element: Component("/pages/data") },
		{ path: "data/imports", element: Component("/pages/data/imports") },
		{ path: "data/imports/preview", element: Component("/pages/data/imports/preview") },
		{ path: "data/exports", element: Component("/pages/data/exports") },
		{ path: "data/exports/history", element: Component("/pages/data/exports/history") },
		{ path: "data/migration", element: Component("/pages/data/migration") },

		// Calendar
		{ path: "calendar", element: Component("/pages/calendar") },
		{ path: "calendar/holidays", element: Component("/pages/calendar/holidays") },
		{ path: "calendar/settings", element: Component("/pages/calendar/settings") },

		// Group Management
		{ path: "group", element: Component("/pages/group") },
		{ path: "group/companies", element: Component("/pages/group/companies") },
		{ path: "group/companies/:id/overrides", element: Component("/pages/group/companies/overrides") },
		{ path: "group/settings", element: Component("/pages/group/settings") },
		{ path: "group/transfers", element: Component("/pages/group/transfers") },

		// Platform Admin
		{ path: "admin", element: Component("/pages/admin") },
		{ path: "admin/settings", element: Component("/pages/admin/settings") },
		{ path: "admin/users", element: Component("/pages/admin/users") },
		{ path: "admin/companies", element: Component("/pages/admin/companies") },
		{ path: "admin/monitoring", element: Component("/pages/admin/monitoring") },
		{ path: "admin/features", element: Component("/pages/admin/features") },
		{ path: "admin/billing", element: Component("/pages/admin/billing") },
		{ path: "admin/audit-logs", element: Component("/pages/admin/audit-logs") },

		// Help & Support
		{ path: "help", element: Component("/pages/help") },
		{ path: "help/articles", element: Component("/pages/help/articles") },
		{ path: "help/contact", element: Component("/pages/help/contact") },

		// Error pages
		{
			path: "error",
			children: [
				{ index: true, element: <Navigate to="403" replace /> },
				{ path: "403", element: Component("/pages/sys/error/Page403") },
				{ path: "404", element: Component("/pages/sys/error/Page404") },
				{ path: "500", element: Component("/pages/sys/error/Page500") },
			],
		},
	];
	return frontendDashboardRoutes;
}

import { lazy } from "react";
import type { RouteObject } from "react-router";

const ESSLayout = lazy(() => import("@/layouts/ess"));
const ESSDashboard = lazy(() => import("@/pages/ess"));
const ESSPayslips = lazy(() => import("@/pages/ess/payslips"));
const ESSPayslipDetail = lazy(() => import("@/pages/ess/payslips/detail"));
const ESSLeave = lazy(() => import("@/pages/ess/leave"));
const ESSLeaveNew = lazy(() => import("@/pages/ess/leave/new"));
const ESSProfile = lazy(() => import("@/pages/ess/profile"));
const ESSDocuments = lazy(() => import("@/pages/ess/documents"));

export function getESSRoutes(): RouteObject[] {
	return [
		{
			path: "ess",
			element: <ESSLayout />,
			children: [
				{ index: true, element: <ESSDashboard /> },
				{ path: "payslips", element: <ESSPayslips /> },
				{ path: "payslips/:id", element: <ESSPayslipDetail /> },
				{ path: "leave", element: <ESSLeave /> },
				{ path: "leave/new", element: <ESSLeaveNew /> },
				{ path: "profile", element: <ESSProfile /> },
				{ path: "documents", element: <ESSDocuments /> },
			],
		},
		{
			path: "employee",
			element: <ESSLayout />,
			children: [
				{ index: true, element: <ESSDashboard /> },
				{ path: "payslips", element: <ESSPayslips /> },
				{ path: "payslips/:id", element: <ESSPayslipDetail /> },
				{ path: "leave", element: <ESSLeave /> },
				{ path: "leave/new", element: <ESSLeaveNew /> },
				{ path: "profile", element: <ESSProfile /> },
				{ path: "documents", element: <ESSDocuments /> },
			],
		},
	];
}

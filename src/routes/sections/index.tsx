import { Navigate, type RouteObject } from "react-router";
import { authRoutes } from "./auth";
import { dashboardRoutes } from "./dashboard";
import { getESSRoutes } from "./ess";
import { mainRoutes } from "./main";

export const routesSection: RouteObject[] = [
	// Auth
	...authRoutes,
	// Dashboard
	...dashboardRoutes,
	// Employee Self-Service
	...getESSRoutes(),
	// Main
	...mainRoutes,
	// No Match
	{ path: "*", element: <Navigate to="/404" replace /> },
];

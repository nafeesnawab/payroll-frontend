import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router";
import { Outlet } from "react-router";
import { LineLoading } from "@/components/loading";

const SignUpPage = lazy(() => import("@/pages/auth/signup"));
const LoginPage = lazy(() => import("@/pages/auth/login"));
const TwoFactorPage = lazy(() => import("@/pages/auth/two-factor"));
const CompanySelectionPage = lazy(() => import("@/pages/auth/companies"));

export const authRoutes: RouteObject[] = [
	{
		path: "auth",
		element: (
			<Suspense fallback={<LineLoading />}>
				<Outlet />
			</Suspense>
		),
		children: [
			{ path: "signup", element: <SignUpPage /> },
			{ path: "login", element: <LoginPage /> },
			{ path: "2fa", element: <TwoFactorPage /> },
			{ path: "companies", element: <CompanySelectionPage /> },
		],
	},
];

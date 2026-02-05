import { useCallback, useEffect } from "react";
import { useActiveCompany, useAuthToken, useHasCompletedOnboarding } from "@/store/authStore";
import { useRouter } from "../hooks";

type Props = {
	children: React.ReactNode;
};
export default function LoginAuthGuard({ children }: Props) {
	const router = useRouter();
	const token = useAuthToken();
	const activeCompany = useActiveCompany();
	const hasCompletedOnboarding = useHasCompletedOnboarding();

	const check = useCallback(() => {
		if (!token?.accessToken) {
			router.replace("/auth/login");
			return;
		}

		if (!activeCompany) {
			router.replace("/auth/companies");
			return;
		}

		if (!hasCompletedOnboarding) {
			const currentPath = window.location.pathname;
			if (!currentPath.startsWith("/settings")) {
				router.replace("/settings/employer");
			}
		}
	}, [router, token, activeCompany, hasCompletedOnboarding]);

	useEffect(() => {
		check();
	}, [check]);

	return <>{children}</>;
}

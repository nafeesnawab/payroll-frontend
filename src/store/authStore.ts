import type { AuthToken, AuthUser, Company, CompanyRole, UserCompany } from "@/types/auth";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
	user: AuthUser | null;
	token: AuthToken | null;
	companies: UserCompany[];
	activeCompany: Company | null;
	activeRole: CompanyRole | null;
	requiresTwoFactor: boolean;
	pendingUserId: string | null;
	hasCompletedOnboarding: boolean;
}

interface AuthActions {
	setUser: (user: AuthUser) => void;
	setToken: (token: AuthToken) => void;
	setCompanies: (companies: UserCompany[]) => void;
	setActiveCompany: (company: Company, role: CompanyRole) => void;
	setRequiresTwoFactor: (requires: boolean, userId?: string) => void;
	setOnboardingComplete: (complete: boolean) => void;
	logout: () => void;
	reset: () => void;
}

type AuthStore = AuthState & { actions: AuthActions };

const initialState: AuthState = {
	user: null,
	token: null,
	companies: [],
	activeCompany: null,
	activeRole: null,
	requiresTwoFactor: false,
	pendingUserId: null,
	hasCompletedOnboarding: false,
};

export const useAuthStore = create<AuthStore>()(
	persist(
		(set) => ({
			...initialState,
			actions: {
				setUser: (user) => set({ user }),
				setToken: (token) => set({ token }),
				setCompanies: (companies) => set({ companies }),
				setActiveCompany: (company, role) => set({ activeCompany: company, activeRole: role }),
				setRequiresTwoFactor: (requires, userId) =>
					set({ requiresTwoFactor: requires, pendingUserId: userId || null }),
				setOnboardingComplete: (complete) => set({ hasCompletedOnboarding: complete }),
				logout: () => set(initialState),
				reset: () => set(initialState),
			},
		}),
		{
			name: "auth-store",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				user: state.user,
				token: state.token,
				companies: state.companies,
				activeCompany: state.activeCompany,
				activeRole: state.activeRole,
				hasCompletedOnboarding: state.hasCompletedOnboarding,
			}),
		},
	),
);

export const useAuth = () => useAuthStore((state) => state);
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthToken = () => useAuthStore((state) => state.token);
export const useAuthCompanies = () => useAuthStore((state) => state.companies);
export const useActiveCompany = () => useAuthStore((state) => state.activeCompany);
export const useActiveRole = () => useAuthStore((state) => state.activeRole);
export const useAuthActions = () => useAuthStore((state) => state.actions);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.token?.accessToken);
export const useRequiresTwoFactor = () =>
	useAuthStore((state) => ({
		requires: state.requiresTwoFactor,
		userId: state.pendingUserId,
	}));
export const useHasCompletedOnboarding = () => useAuthStore((state) => state.hasCompletedOnboarding);

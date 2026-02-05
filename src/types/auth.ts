import type { BasicStatus } from "./enum";

export interface Company {
	id: string;
	name: string;
	tradingName?: string;
	registrationNumber?: string;
	taxNumber?: string;
	status: BasicStatus;
	createdAt: string;
	updatedAt: string;
}

export interface UserCompany {
	id: string;
	companyId: string;
	userId: string;
	role: CompanyRole;
	company: Company;
}

export enum CompanyRole {
	OWNER = "owner",
	ADMIN = "admin",
	PAYROLL_ADMIN = "payroll_admin",
	VIEWER = "viewer",
}

export interface AuthUser {
	id: string;
	email: string;
	fullName: string;
	avatar?: string;
	twoFactorEnabled: boolean;
	emailVerified: boolean;
	status: BasicStatus;
	createdAt: string;
}

export interface AuthToken {
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
}

export interface SignUpRequest {
	companyName: string;
	fullName: string;
	email: string;
	password: string;
}

export interface SignUpResponse {
	user: AuthUser;
	company: Company;
	token: AuthToken;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	user: AuthUser;
	companies: UserCompany[];
	token: AuthToken;
	requiresTwoFactor: boolean;
}

export interface TwoFactorRequest {
	code: string;
	userId: string;
}

export interface TwoFactorResponse {
	user: AuthUser;
	companies: UserCompany[];
	token: AuthToken;
}

export interface SelectCompanyRequest {
	companyId: string;
}

export interface SelectCompanyResponse {
	company: Company;
	role: CompanyRole;
}

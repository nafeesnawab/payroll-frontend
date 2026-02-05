export interface EmployerDetails {
	id: string;
	companyName: string;
	tradingName: string;
	registrationNumber: string;
	industry: string;
	physicalAddress: Address;
	postalAddress: Address;
	contactEmail: string;
	contactPhone: string;
	payeNumber: string;
	uifNumber: string;
	sdlNumber: string;
	logoUrl?: string;
	isComplete: boolean;
}

export interface Address {
	line1: string;
	line2?: string;
	city: string;
	province: string;
	postalCode: string;
}

export interface BankAccount {
	id: string;
	bankName: string;
	accountHolderName: string;
	accountNumber: string;
	branchCode: string;
	accountType: "current" | "savings" | "transmission";
	eftFormat: string;
	isPrimary: boolean;
}

export interface PayFrequency {
	id: string;
	name: string;
	type: "monthly" | "weekly" | "fortnightly" | "custom";
	startDate: string;
	cutOffDay: number;
	payDay: number;
	isActive: boolean;
}

export interface PayPoint {
	id: string;
	name: string;
	code: string;
	description?: string;
	employeeCount: number;
}

export interface JobGrade {
	id: string;
	name: string;
	code: string;
	bargainingCouncilId?: string;
	minimumWage?: number;
}

export interface BargainingCouncil {
	id: string;
	name: string;
	code: string;
}

export interface LeaveType {
	id: string;
	name: string;
	category: "annual" | "sick" | "family" | "unpaid" | "custom";
	accrualMethod: "monthly" | "per_hour" | "upfront";
	daysPerYear: number;
	carryOverDays: number;
	allowNegative: boolean;
	isActive: boolean;
}

export interface PayrollItem {
	id: string;
	name: string;
	code: string;
	type: "earning" | "deduction";
	taxable: boolean;
	uifApplicable: boolean;
	isRecurring: boolean;
	isActive: boolean;
}

export interface SalaryRules {
	costToCompanyEnabled: boolean;
	proRataMethod: "calendar" | "working_days";
	terminationPayMethod: "immediate" | "next_payrun";
	etiEnabled: boolean;
	etiMaxAge: number;
	overtimeRate: number;
	sundayRate: number;
	publicHolidayRate: number;
}

export interface PayslipConfig {
	showLogo: boolean;
	showEmployerAddress: boolean;
	showLeaveBalances: boolean;
	showYtdTotals: boolean;
	customFooterText: string;
}

export interface EmployeeNumbering {
	autoGenerate: boolean;
	prefix: string;
	startingNumber: number;
	allowManualOverride: boolean;
}

export interface CustomField {
	id: string;
	name: string;
	fieldType: "text" | "number" | "date" | "select";
	options?: string[];
	isRequired: boolean;
	isActive: boolean;
}

export interface Beneficiary {
	id: string;
	name: string;
	bankName: string;
	accountNumber: string;
	branchCode: string;
	reference: string;
	linkedPayrollItemIds: string[];
}

export interface AccountingConfig {
	system: "xero" | "sage" | "quickbooks" | "pastel" | "manual";
	exportFormat: "csv" | "excel" | "api";
	glMappings: Record<string, string>;
}

export interface RelatedCompany {
	id: string;
	name: string;
	registrationNumber: string;
	canTransferTo: boolean;
	canTransferFrom: boolean;
}

export interface NotificationSettings {
	filingReminders: boolean;
	filingReminderDays: number;
	payrollReminders: boolean;
	payrollReminderDays: number;
	recipientEmails: string[];
}

export interface SettingsUser {
	id: string;
	email: string;
	name: string;
	role: "owner" | "admin" | "viewer";
	invitedAt: string;
	acceptedAt?: string;
}

export interface SettingsCompletion {
	employer: boolean;
	banking: boolean;
	payFrequencies: boolean;
	leaveTypes: boolean;
	salaryRules: boolean;
	percentage: number;
}

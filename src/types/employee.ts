export type EmployeeStatus = "active" | "inactive" | "terminated";
export type EmploymentType = "full_time" | "part_time" | "director" | "contractor";
export type IdType = "sa_id" | "passport" | "asylum" | "refugee";
export type SalaryType = "fixed" | "hourly";
export type Gender = "male" | "female" | "other";

export interface Employee {
	id: string;
	employeeNumber: string;
	firstName: string;
	lastName: string;
	fullName: string;
	status: EmployeeStatus;
	email: string;
	phone: string;
	idType: IdType;
	idNumber: string;
	dateOfBirth: string;
	gender: Gender;
	physicalAddress: string;
	employmentType: EmploymentType;
	startDate: string;
	terminationDate?: string;
	terminationReason?: string;
	payFrequencyId: string;
	payFrequencyName: string;
	payPointId: string;
	payPointName: string;
	jobGradeId: string;
	jobGradeName: string;
	workingDaysPerWeek: number;
	workingHoursPerDay: number;
	salaryType: SalaryType;
	salaryAmount: number;
	costToCompany: boolean;
	overtimeEligible: boolean;
	bankName: string;
	bankAccountNumber: string;
	bankBranchCode: string;
	bankAccountType: string;
	taxNumber?: string;
	uifIncluded: boolean;
	sdlIncluded: boolean;
	etiEligible: boolean;
	hasErrors: boolean;
	errors?: string[];
	createdAt: string;
	updatedAt: string;
}

export interface EmployeeListItem {
	id: string;
	employeeNumber: string;
	fullName: string;
	status: EmployeeStatus;
	payFrequencyName: string;
	payPointName: string;
	jobGradeName: string;
	hasErrors: boolean;
}

export interface EmployeeLeaveBalance {
	leaveTypeId: string;
	leaveTypeName: string;
	entitled: number;
	taken: number;
	pending: number;
	balance: number;
}

export interface EmployeePayslip {
	id: string;
	period: string;
	grossPay: number;
	netPay: number;
	deductions: number;
	paidAt: string;
}

export interface EmployeeHistoryItem {
	id: string;
	action: string;
	description: string;
	performedBy: string;
	performedAt: string;
}

export interface CreateEmployeeStep1 {
	firstName: string;
	lastName: string;
	idType: IdType;
	idNumber: string;
	dateOfBirth: string;
	gender: Gender;
	email: string;
	phone: string;
	physicalAddress: string;
}

export interface CreateEmployeeStep2 {
	employeeNumber: string;
	employmentType: EmploymentType;
	startDate: string;
	payFrequencyId: string;
	payPointId: string;
	jobGradeId: string;
	workingDaysPerWeek: number;
	workingHoursPerDay: number;
}

export interface CreateEmployeeStep3 {
	salaryType: SalaryType;
	salaryAmount: number;
	costToCompany: boolean;
	overtimeEligible: boolean;
	bankName: string;
	bankAccountNumber: string;
	bankBranchCode: string;
	bankAccountType: string;
}

export interface CreateEmployeeStep4 {
	taxNumber: string;
	uifIncluded: boolean;
	sdlIncluded: boolean;
	etiEligible: boolean;
}

export interface CreateEmployeeRequest extends CreateEmployeeStep1, CreateEmployeeStep2, CreateEmployeeStep3, CreateEmployeeStep4 {}

export interface TerminateEmployeeRequest {
	terminationDate: string;
	reason: string;
	payOutLeave: boolean;
}

export interface TransferEmployeeRequest {
	targetCompanyId: string;
	transferDate: string;
	retainLeaveBalances: boolean;
	retainSalaryHistory: boolean;
}

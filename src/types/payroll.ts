export type PayrunStatus = "draft" | "calculating" | "ready" | "finalized";

export interface Payrun {
	id: string;
	payPeriod: string;
	payPeriodStart: string;
	payPeriodEnd: string;
	payDate: string;
	payFrequencyId: string;
	payFrequencyName: string;
	status: PayrunStatus;
	employeeCount: number;
	totalGross: number;
	totalDeductions: number;
	totalNet: number;
	employeesWithErrors: number;
	createdAt: string;
	finalizedAt?: string;
}

export interface PayrunListItem {
	id: string;
	payPeriod: string;
	payFrequencyName: string;
	status: PayrunStatus;
	employeeCount: number;
	totalGross: number;
	totalNet: number;
}

export interface PayrunEmployee {
	id: string;
	employeeId: string;
	employeeNumber: string;
	employeeName: string;
	grossPay: number;
	totalDeductions: number;
	netPay: number;
	hasErrors: boolean;
	errors?: string[];
}

export interface PayslipEarning {
	id: string;
	name: string;
	code: string;
	amount: number;
	hours?: number;
	rate?: number;
	taxable: boolean;
	isRequired: boolean;
	note?: string;
}

export interface PayslipDeduction {
	id: string;
	name: string;
	code: string;
	amount: number;
	isSkipped: boolean;
	isRequired: boolean;
	note?: string;
}

export interface EmployeePayslip {
	id: string;
	payrunId: string;
	employeeId: string;
	employeeNumber: string;
	employeeName: string;
	payPeriod: string;
	payDate: string;
	earnings: PayslipEarning[];
	deductions: PayslipDeduction[];
	grossPay: number;
	totalDeductions: number;
	netPay: number;
	hasErrors: boolean;
	errors?: string[];
	ytdGross: number;
	ytdTax: number;
	ytdNet: number;
}

export interface CreatePayrunRequest {
	payFrequencyId: string;
	payPeriodStart: string;
	payPeriodEnd: string;
	payDate: string;
	payPointIds?: string[];
}

export interface UpdatePayslipRequest {
	earnings: Array<{
		id: string;
		amount: number;
		hours?: number;
		note?: string;
	}>;
	deductions: Array<{
		id: string;
		amount: number;
		isSkipped: boolean;
		note?: string;
	}>;
}

export interface PayrunSummary {
	totalGross: number;
	totalPAYE: number;
	totalUIF: number;
	totalSDL: number;
	totalOtherDeductions: number;
	totalNet: number;
	employerUIF: number;
	employerSDL: number;
	totalCostToCompany: number;
}

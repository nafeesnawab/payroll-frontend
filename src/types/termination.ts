export type TerminationStatus = "draft" | "pending_payroll" | "completed";

export type TerminationReason = "resignation" | "dismissal" | "retrenchment" | "contract_end" | "death";

export interface Termination {
	id: string;
	employeeId: string;
	employeeName: string;
	employeeNumber: string;
	terminationDate: string;
	lastWorkingDay: string;
	reason: TerminationReason;
	status: TerminationStatus;
	noticePeriodDays: number;
	paidInLieu: boolean;
	finalPayPeriod: string;
	createdAt: string;
	updatedAt: string;
	finalizedAt: string | null;
	finalizedBy: string | null;
}

export interface TerminationPayComponents {
	earnings: {
		finalSalary: number;
		noticePay: number;
		severancePay: number;
		proRataEarnings: number;
		leavePayoutDays: number;
		leavePayoutAmount: number;
	};
	deductions: {
		id: string;
		name: string;
		amount: number;
		skip: boolean;
	}[];
	summary: {
		grossPay: number;
		totalDeductions: number;
		netPay: number;
		paye: number;
		uif: number;
	};
}

export interface TerminationPreview {
	employeeName: string;
	employeeNumber: string;
	terminationDate: string;
	reason: TerminationReason;
	payComponents: TerminationPayComponents;
	validation: {
		errors: { code: string; message: string }[];
		warnings: { code: string; message: string }[];
	};
}

export interface TerminationDocument {
	id: string;
	type: "final_payslip" | "irp5" | "uif_ui19" | "uif_ui27" | "confirmation_letter";
	name: string;
	generatedAt: string;
	downloadUrl: string;
}

export interface TerminationDetail extends Termination {
	payComponents: TerminationPayComponents;
	documents: TerminationDocument[];
	auditLog: {
		id: string;
		action: string;
		user: string;
		timestamp: string;
		notes?: string;
	}[];
}

export interface CreateTerminationInput {
	employeeId: string;
	terminationDate: string;
	lastWorkingDay: string;
	reason: TerminationReason;
	paidInLieu: boolean;
}

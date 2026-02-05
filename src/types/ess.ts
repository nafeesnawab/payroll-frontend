export interface ESSOverview {
	latestPayslip: {
		id: string;
		payPeriod: string;
		payDate: string;
		netPay: number;
	} | null;
	leaveBalances: Array<{
		leaveTypeId: string;
		leaveTypeName: string;
		available: number;
	}>;
	upcomingLeave: Array<{
		id: string;
		leaveTypeName: string;
		startDate: string;
		endDate: string;
		days: number;
		status: string;
	}>;
}

export interface ESSNotification {
	id: string;
	type:
		| "payslip_released"
		| "leave_approved"
		| "leave_rejected"
		| "profile_change_approved"
		| "profile_change_rejected";
	title: string;
	message: string;
	isRead: boolean;
	createdAt: string;
	relatedId?: string;
}

export interface ESSPayslip {
	id: string;
	payPeriod: string;
	payDate: string;
	grossPay: number;
	netPay: number;
	status: "finalized";
}

export interface ESSPayslipDetail {
	id: string;
	payPeriod: string;
	payDate: string;
	employeeName: string;
	employeeNumber: string;
	employerName: string;
	employerAddress: string;
	earnings: Array<{
		name: string;
		amount: number;
		isRecurring: boolean;
	}>;
	deductions: Array<{
		name: string;
		amount: number;
		isStatutory: boolean;
	}>;
	grossPay: number;
	totalDeductions: number;
	netPay: number;
	bankName: string;
	accountNumber: string;
	notes?: string;
}

export interface ESSLeaveBalance {
	leaveTypeId: string;
	leaveTypeName: string;
	accrued: number;
	taken: number;
	pending: number;
	available: number;
}

export interface ESSLeaveRequest {
	id: string;
	leaveTypeId: string;
	leaveTypeName: string;
	startDate: string;
	endDate: string;
	days: number;
	status: "pending" | "approved" | "rejected" | "cancelled";
	reason?: string;
	attachmentUrl?: string;
	approvedBy?: string;
	approvedAt?: string;
	rejectedBy?: string;
	rejectedAt?: string;
	rejectionReason?: string;
	createdAt: string;
}

export interface CreateESSLeaveRequest {
	leaveTypeId: string;
	startDate: string;
	endDate: string;
	reason?: string;
	attachmentUrl?: string;
}

export interface ESSProfile {
	employeeId: string;
	employeeNumber: string;
	firstName: string;
	lastName: string;
	idNumber?: string;
	passportNumber?: string;
	taxNumber?: string;
	email: string;
	phone?: string;
	address?: string;
	bankName?: string;
	accountNumber?: string;
	branchCode?: string;
	accountType?: string;
	startDate: string;
	position: string;
	department?: string;
}

export interface ESSProfileChangeRequest {
	id: string;
	field: string;
	currentValue: string;
	requestedValue: string;
	status: "pending" | "approved" | "rejected";
	reason?: string;
	rejectionReason?: string;
	createdAt: string;
	processedAt?: string;
	processedBy?: string;
}

export interface CreateProfileChangeRequest {
	field: string;
	currentValue: string;
	requestedValue: string;
	reason?: string;
}

export interface ESSDocument {
	id: string;
	name: string;
	type: "irp5" | "it3a" | "employment_letter" | "payslip" | "other";
	taxYear?: string;
	description?: string;
	downloadUrl: string;
	releasedAt: string;
}

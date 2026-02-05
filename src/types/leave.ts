export type LeaveRequestStatus = "pending" | "approved" | "rejected" | "cancelled";
export type AccrualMethod = "monthly" | "annual" | "none";

export interface LeaveType {
	id: string;
	name: string;
	code: string;
	accrualMethod: AccrualMethod;
	accrualRate: number;
	cycleStartMonth: number;
	carryOverLimit: number | null;
	carryOverExpireMonths: number | null;
	allowNegativeBalance: boolean;
	requiresAttachment: boolean;
	isPaid: boolean;
	isActive: boolean;
}

export interface LeaveBalance {
	id: string;
	employeeId: string;
	employeeName: string;
	employeeNumber: string;
	leaveTypeId: string;
	leaveTypeName: string;
	accrued: number;
	taken: number;
	pending: number;
	available: number;
	isNegative: boolean;
}

export interface LeaveRequest {
	id: string;
	employeeId: string;
	employeeName: string;
	employeeNumber: string;
	leaveTypeId: string;
	leaveTypeName: string;
	startDate: string;
	endDate: string;
	days: number;
	isPartialDay: boolean;
	partialHours?: number;
	status: LeaveRequestStatus;
	reason?: string;
	attachmentUrl?: string;
	approvedBy?: string;
	approvedAt?: string;
	rejectedBy?: string;
	rejectedAt?: string;
	rejectionReason?: string;
	createdAt: string;
}

export interface LeaveOverview {
	employeesOnLeave: number;
	pendingApprovals: number;
	negativeBalances: number;
	expiringBalances: number;
	upcomingLeave: Array<{
		id: string;
		employeeName: string;
		leaveTypeName: string;
		startDate: string;
		endDate: string;
		days: number;
	}>;
}

export interface LeaveCalendarEvent {
	id: string;
	employeeId: string;
	employeeName: string;
	leaveTypeId: string;
	leaveTypeName: string;
	startDate: string;
	endDate: string;
	days: number;
	color: string;
}

export interface CreateLeaveRequestInput {
	leaveTypeId: string;
	startDate: string;
	endDate: string;
	isPartialDay: boolean;
	partialHours?: number;
	reason?: string;
	attachmentUrl?: string;
}

export interface LeaveBalanceAdjustment {
	employeeId: string;
	leaveTypeId: string;
	amount: number;
	reason: string;
}

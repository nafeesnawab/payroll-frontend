export type FilingStatus = "draft" | "ready" | "submitted" | "accepted" | "rejected";

export type UIFDeclarationType = "start" | "update" | "termination";

export type CertificateType = "IRP5" | "IT3a";

export interface FilingOverview {
	emp201: {
		currentPeriod: string;
		status: FilingStatus;
		dueDate: string;
		totalPaye: number;
		totalUif: number;
		totalSdl: number;
	};
	emp501: {
		taxYear: string;
		status: FilingStatus;
		type: "interim" | "final";
		dueDate: string;
	};
	irp5: {
		taxYear: string;
		totalCertificates: number;
		generatedCount: number;
		status: "pending" | "in_progress" | "completed";
	};
	uif: {
		pendingDeclarations: number;
		lastSubmission: string | null;
	};
	alerts: FilingAlert[];
}

export interface FilingAlert {
	id: string;
	type: "error" | "warning" | "info";
	title: string;
	message: string;
	filingType: "emp201" | "emp501" | "irp5" | "uif";
	dueDate?: string;
}

export interface EMP201 {
	id: string;
	period: string;
	month: number;
	year: number;
	status: FilingStatus;
	totalPaye: number;
	totalUif: number;
	totalSdl: number;
	totalEmployees: number;
	submissionDate: string | null;
	submittedBy: string | null;
	payrunIds: string[];
	createdAt: string;
	updatedAt: string;
}

export interface EMP201Detail extends EMP201 {
	payruns: {
		id: string;
		name: string;
		periodStart: string;
		periodEnd: string;
		paye: number;
		uif: number;
		sdl: number;
		employeeCount: number;
	}[];
	validation: {
		errors: ValidationItem[];
		warnings: ValidationItem[];
	};
	auditLog: AuditLogEntry[];
}

export interface ValidationItem {
	code: string;
	message: string;
	field?: string;
	severity: "error" | "warning";
}

export interface AuditLogEntry {
	id: string;
	action: string;
	user: string;
	timestamp: string;
	notes?: string;
}

export interface UIFDeclaration {
	id: string;
	employeeId: string;
	employeeName: string;
	employeeNumber: string;
	idNumber: string;
	declarationType: UIFDeclarationType;
	status: FilingStatus;
	effectiveDate: string;
	lastUpdated: string;
	submittedDate: string | null;
}

export interface EMP501 {
	id: string;
	taxYear: string;
	type: "interim" | "final";
	status: FilingStatus;
	payrollTotalPaye: number;
	emp201TotalPaye: number;
	variance: number;
	employeeCount: number;
	generatedAt: string | null;
	submittedAt: string | null;
}

export interface EMP501Detail extends EMP501 {
	employees: EMP501Employee[];
	emp201Periods: {
		period: string;
		paye: number;
		uif: number;
		sdl: number;
	}[];
	validation: {
		errors: ValidationItem[];
		warnings: ValidationItem[];
	};
	auditLog: AuditLogEntry[];
}

export interface EMP501Employee {
	employeeId: string;
	employeeName: string;
	employeeNumber: string;
	taxNumber: string;
	payrollPaye: number;
	emp201Paye: number;
	variance: number;
	hasMismatch: boolean;
}

export interface IRP5Certificate {
	id: string;
	employeeId: string;
	employeeName: string;
	employeeNumber: string;
	taxNumber: string;
	taxYear: string;
	certificateType: CertificateType;
	status: "draft" | "generated" | "issued";
	grossIncome: number;
	totalPaye: number;
	generatedAt: string | null;
	issuedAt: string | null;
}

export interface FilingDownload {
	id: string;
	filingType: "emp201" | "emp501" | "irp5" | "uif";
	filingId: string;
	fileName: string;
	format: "pdf" | "csv" | "sars";
	generatedAt: string;
	downloadUrl: string;
}

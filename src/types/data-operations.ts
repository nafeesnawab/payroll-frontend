export type ImportType =
	| "employees"
	| "bank_details"
	| "leave_balances"
	| "ytd_values"
	| "payroll_inputs"
	| "beneficiaries";

export type ExportType =
	| "employees"
	| "payroll_history"
	| "payslips"
	| "leave_balances"
	| "leave_history"
	| "filings"
	| "audit_logs";

export type ExportFormat = "csv" | "excel" | "pdf";

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export type MigrationSource = "simplepay" | "payspace" | "sage" | "custom";

export type ValidationSeverity = "error" | "warning";

export interface DataOverview {
	recentImports: number;
	recentExports: number;
	migrationStatus: "idle" | "in_progress" | "completed";
	failedJobs: number;
	lastImportAt?: string;
	lastExportAt?: string;
}

export interface ImportJob {
	id: string;
	type: ImportType;
	typeLabel: string;
	fileName: string;
	fileSize: number;
	status: JobStatus;
	totalRows: number;
	validRows: number;
	errorRows: number;
	warningRows: number;
	uploadedBy: string;
	uploadedAt: string;
	committedAt?: string;
}

export interface ValidationResult {
	row: number;
	field: string;
	value: string;
	severity: ValidationSeverity;
	message: string;
}

export interface ImportPreview {
	jobId: string;
	type: ImportType;
	typeLabel: string;
	fileName: string;
	totalRows: number;
	validRows: number;
	errorCount: number;
	warningCount: number;
	canCommit: boolean;
	validationResults: ValidationResult[];
	previewData: Record<string, unknown>[];
}

export interface ExportJob {
	id: string;
	type: ExportType;
	typeLabel: string;
	format: ExportFormat;
	status: JobStatus;
	requestedBy: string;
	requestedAt: string;
	completedAt?: string;
	downloadUrl?: string;
	fileSize?: number;
	recordCount?: number;
	dateRange?: {
		start: string;
		end: string;
	};
}

export interface ExportRequest {
	type: ExportType;
	format: ExportFormat;
	dateRange?: {
		start: string;
		end: string;
	};
	filters?: Record<string, unknown>;
}

export interface MigrationJob {
	id: string;
	source: MigrationSource;
	sourceLabel: string;
	status: JobStatus;
	currentStep: number;
	totalSteps: number;
	stepLabel: string;
	createdBy: string;
	createdAt: string;
	completedAt?: string;
	employeesImported?: number;
	errorsCount?: number;
}

export interface FieldMapping {
	sourceField: string;
	targetField: string;
	transformation?: string;
}

export interface MigrationConfig {
	source: MigrationSource;
	fieldMappings: FieldMapping[];
	options: {
		importEmployees: boolean;
		importLeaveBalances: boolean;
		importYtdValues: boolean;
		importBankDetails: boolean;
	};
}

export interface OpeningBalance {
	id: string;
	employeeId: string;
	employeeName: string;
	type: "leave" | "ytd_earnings" | "ytd_deductions" | "tax";
	category: string;
	amount: number;
	isLocked: boolean;
	appliedAt?: string;
}

export const IMPORT_TYPE_LABELS: Record<ImportType, string> = {
	employees: "Employees",
	bank_details: "Bank Details",
	leave_balances: "Opening Leave Balances",
	ytd_values: "YTD Payroll Values",
	payroll_inputs: "Payroll Inputs",
	beneficiaries: "Beneficiaries & Deductions",
};

export const EXPORT_TYPE_LABELS: Record<ExportType, string> = {
	employees: "Employees",
	payroll_history: "Payroll History",
	payslips: "Payslips",
	leave_balances: "Leave Balances",
	leave_history: "Leave History",
	filings: "Filings",
	audit_logs: "Audit Logs",
};

export const MIGRATION_SOURCE_LABELS: Record<MigrationSource, string> = {
	simplepay: "SimplePay",
	payspace: "PaySpace",
	sage: "Sage Payroll",
	custom: "Custom CSV",
};

export const MIGRATION_STEPS = [
	"Select Source",
	"Upload Files",
	"Map Fields",
	"Validate Data",
	"Preview Results",
	"Commit Migration",
];

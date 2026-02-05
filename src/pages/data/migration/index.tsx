import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowRight, CheckCircle, FileSpreadsheet, RefreshCw, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { FieldMapping, MigrationJob, MigrationSource } from "@/types/data-operations";
import { MIGRATION_SOURCE_LABELS, MIGRATION_STEPS } from "@/types/data-operations";
import { Alert, AlertDescription } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";

const TARGET_FIELDS = [
	"employee_number",
	"first_name",
	"last_name",
	"id_number",
	"email",
	"phone",
	"start_date",
	"department",
	"job_title",
	"salary",
	"bank_name",
	"account_number",
	"branch_code",
];

export default function MigrationWizardPage() {
	const queryClient = useQueryClient();
	const [currentStep, setCurrentStep] = useState(0);
	const [source, setSource] = useState<MigrationSource | "">("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
	const [options, setOptions] = useState({
		importEmployees: true,
		importLeaveBalances: true,
		importYtdValues: true,
		importBankDetails: true,
	});

	const { data: recentMigrations, isLoading } = useQuery({
		queryKey: ["migration-jobs"],
		queryFn: async () => {
			const response = await axios.get("/api/data/migration/jobs");
			return response.data.data as MigrationJob[];
		},
	});

	const validateMigration = useMutation({
		mutationFn: async () => {
			const response = await axios.post("/api/data/migration/validate", {
				source,
				fieldMappings,
				options,
			});
			return response.data;
		},
		onSuccess: () => {
			toast.success("Validation passed");
			setCurrentStep(4);
		},
		onError: () => {
			toast.error("Validation failed");
		},
	});

	const commitMigration = useMutation({
		mutationFn: async () => {
			const response = await axios.post("/api/data/migration/commit", {
				source,
				fieldMappings,
				options,
			});
			return response.data;
		},
		onSuccess: () => {
			toast.success("Migration completed successfully");
			queryClient.invalidateQueries({ queryKey: ["migration-jobs"] });
			setCurrentStep(0);
			setSource("");
			setSelectedFile(null);
			setFieldMappings([]);
		},
		onError: () => {
			toast.error("Migration failed");
		},
	});

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			const mockSourceFields = [
				"EmpNo",
				"FirstName",
				"Surname",
				"IDNumber",
				"EmailAddress",
				"CellPhone",
				"HireDate",
				"Dept",
				"Position",
				"BasicSalary",
				"BankName",
				"AccNo",
				"BranchCode",
			];
			setFieldMappings(
				mockSourceFields.map((sf, i) => ({
					sourceField: sf,
					targetField: TARGET_FIELDS[i] || "",
				})),
			);
		}
	};

	const updateMapping = (sourceField: string, targetField: string) => {
		setFieldMappings((prev) => prev.map((m) => (m.sourceField === sourceField ? { ...m, targetField } : m)));
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "completed":
				return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
			case "processing":
				return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
			case "pending":
				return <Badge variant="secondary">Pending</Badge>;
			case "failed":
				return <Badge variant="destructive">Failed</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-96" />
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div>
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<RefreshCw className="h-6 w-6" />
					Data Migration
				</h1>
				<p className="text-muted-foreground">Migrate data from other payroll systems</p>
			</div>

			{/* Progress Steps */}
			<div className="flex items-center justify-between">
				{MIGRATION_STEPS.map((step, index) => (
					<div key={step} className="flex items-center">
						<div
							className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
								index < currentStep
									? "bg-green-600 text-white"
									: index === currentStep
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground"
							}`}
						>
							{index < currentStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
						</div>
						<span
							className={`ml-2 text-sm hidden md:inline ${
								index === currentStep ? "font-medium" : "text-muted-foreground"
							}`}
						>
							{step}
						</span>
						{index < MIGRATION_STEPS.length - 1 && <ArrowRight className="mx-4 h-4 w-4 text-muted-foreground" />}
					</div>
				))}
			</div>

			{/* Step Content */}
			<Card>
				<CardHeader>
					<CardTitle>{MIGRATION_STEPS[currentStep]}</CardTitle>
					<CardDescription>
						{currentStep === 0 && "Choose the system you're migrating from"}
						{currentStep === 1 && "Upload your data files"}
						{currentStep === 2 && "Map source fields to PayPilot fields"}
						{currentStep === 3 && "Validate your data before importing"}
						{currentStep === 4 && "Review and confirm the migration"}
						{currentStep === 5 && "Finalize the migration"}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Step 0: Select Source */}
					{currentStep === 0 && (
						<RadioGroup
							value={source}
							onValueChange={(v) => setSource(v as MigrationSource)}
							className="grid grid-cols-2 gap-4"
						>
							{Object.entries(MIGRATION_SOURCE_LABELS).map(([key, label]) => (
								<div key={key}>
									<RadioGroupItem value={key} id={key} className="peer sr-only" />
									<Label
										htmlFor={key}
										className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
									>
										<FileSpreadsheet className="mb-3 h-8 w-8" />
										{label}
									</Label>
								</div>
							))}
						</RadioGroup>
					)}

					{/* Step 1: Upload Files */}
					{currentStep === 1 && (
						<div className="space-y-4">
							<div className="border-2 border-dashed rounded-lg p-8 text-center">
								<Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
								<Label htmlFor="migration-file" className="cursor-pointer">
									<span className="text-primary hover:underline">Click to upload</span>
									{" your export file"}
								</Label>
								<Input
									id="migration-file"
									type="file"
									accept=".csv,.xlsx,.xls"
									onChange={handleFileUpload}
									className="hidden"
								/>
								<p className="text-xs text-muted-foreground mt-2">
									Export from {MIGRATION_SOURCE_LABELS[source as MigrationSource]} and upload here
								</p>
							</div>
							{selectedFile && (
								<Alert>
									<FileSpreadsheet className="h-4 w-4" />
									<AlertDescription>
										<strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
									</AlertDescription>
								</Alert>
							)}
							<div className="space-y-3">
								<Label>Import Options</Label>
								<div className="space-y-2">
									{Object.entries(options).map(([key, value]) => (
										<div key={key} className="flex items-center gap-2">
											<Checkbox
												id={key}
												checked={value}
												onCheckedChange={(checked) => setOptions({ ...options, [key]: checked })}
											/>
											<Label htmlFor={key} className="capitalize">
												{key.replace(/([A-Z])/g, " $1").replace("import ", "Import ")}
											</Label>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{/* Step 2: Map Fields */}
					{currentStep === 2 && (
						<div className="space-y-4">
							<p className="text-sm text-muted-foreground">
								Match each source field to the corresponding PayPilot field
							</p>
							<div className="space-y-3 max-h-96 overflow-y-auto">
								{fieldMappings.map((mapping) => (
									<div key={mapping.sourceField} className="grid grid-cols-3 gap-4 items-center">
										<div className="font-mono text-sm bg-muted px-3 py-2 rounded">{mapping.sourceField}</div>
										<ArrowRight className="h-4 w-4 mx-auto text-muted-foreground" />
										<Select value={mapping.targetField} onValueChange={(v) => updateMapping(mapping.sourceField, v)}>
											<SelectTrigger>
												<SelectValue placeholder="Select field" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="">-- Skip --</SelectItem>
												{TARGET_FIELDS.map((field) => (
													<SelectItem key={field} value={field}>
														{field.replace(/_/g, " ")}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Step 3: Validate */}
					{currentStep === 3 && (
						<div className="text-center py-8">
							<CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
							<h3 className="text-lg font-medium mb-2">Ready to Validate</h3>
							<p className="text-muted-foreground mb-6">
								Click the button below to validate your data before importing
							</p>
							<Button onClick={() => validateMigration.mutate()} disabled={validateMigration.isPending}>
								{validateMigration.isPending ? "Validating..." : "Validate Data"}
							</Button>
						</div>
					)}

					{/* Step 4: Preview */}
					{currentStep === 4 && (
						<div className="space-y-4">
							<Alert>
								<CheckCircle className="h-4 w-4" />
								<AlertDescription>Validation passed. Review the summary below before committing.</AlertDescription>
							</Alert>
							<div className="grid gap-4 md:grid-cols-2">
								<div className="p-4 border rounded-lg">
									<p className="text-sm text-muted-foreground">Source System</p>
									<p className="font-medium">{MIGRATION_SOURCE_LABELS[source as MigrationSource]}</p>
								</div>
								<div className="p-4 border rounded-lg">
									<p className="text-sm text-muted-foreground">Fields Mapped</p>
									<p className="font-medium">
										{fieldMappings.filter((m) => m.targetField).length} / {fieldMappings.length}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Step 5: Commit */}
					{currentStep === 5 && (
						<div className="text-center py-8">
							<RefreshCw className="h-16 w-16 mx-auto text-primary mb-4" />
							<h3 className="text-lg font-medium mb-2">Commit Migration</h3>
							<p className="text-muted-foreground mb-6">This will import all validated data into PayPilot</p>
							<Button onClick={() => commitMigration.mutate()} disabled={commitMigration.isPending}>
								{commitMigration.isPending ? "Migrating..." : "Commit Migration"}
							</Button>
						</div>
					)}

					{/* Navigation */}
					<div className="flex justify-between pt-4 border-t">
						<Button
							variant="outline"
							onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
							disabled={currentStep === 0}
						>
							Back
						</Button>
						{currentStep < 3 && (
							<Button
								onClick={() => setCurrentStep((s) => s + 1)}
								disabled={(currentStep === 0 && !source) || (currentStep === 1 && !selectedFile)}
							>
								Next
							</Button>
						)}
						{currentStep === 4 && <Button onClick={() => setCurrentStep(5)}>Proceed to Commit</Button>}
					</div>
				</CardContent>
			</Card>

			{/* Recent Migrations */}
			{recentMigrations && recentMigrations.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Recent Migrations</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{recentMigrations.map((job) => (
								<div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
									<div>
										<p className="font-medium">{job.sourceLabel}</p>
										<p className="text-sm text-muted-foreground">{job.employeesImported} employees imported</p>
									</div>
									<div className="text-right">
										{getStatusBadge(job.status)}
										<p className="text-xs text-muted-foreground mt-1">{new Date(job.createdAt).toLocaleDateString()}</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

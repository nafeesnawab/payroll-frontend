import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ArrowDownToLine, Calendar, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { ExportType, ExportFormat, ExportRequest } from "@/types/data-operations";
import { EXPORT_TYPE_LABELS } from "@/types/data-operations";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

export default function ExportDataPage() {
	const navigate = useNavigate();
	const [exportType, setExportType] = useState<ExportType | "">("");
	const [format, setFormat] = useState<ExportFormat>("csv");
	const [dateRange, setDateRange] = useState({ start: "", end: "" });

	const createExport = useMutation({
		mutationFn: async (request: ExportRequest) => {
			const response = await axios.post("/api/data/exports", request);
			return response.data;
		},
		onSuccess: (data) => {
			if (data.data.status === "completed") {
				toast.success("Export ready for download");
			} else {
				toast.success("Export started. You'll be notified when ready.");
			}
			navigate("/data/exports/history");
		},
		onError: () => {
			toast.error("Failed to create export");
		},
	});

	const handleExport = () => {
		if (!exportType) {
			toast.error("Please select what to export");
			return;
		}

		createExport.mutate({
			type: exportType,
			format,
			dateRange: dateRange.start && dateRange.end ? dateRange : undefined,
		});
	};

	const getFormatIcon = (fmt: ExportFormat) => {
		switch (fmt) {
			case "csv":
				return <FileSpreadsheet className="h-5 w-5" />;
			case "excel":
				return <FileSpreadsheet className="h-5 w-5" />;
			case "pdf":
				return <FileText className="h-5 w-5" />;
		}
	};

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<ArrowDownToLine className="h-6 w-6" />
						Export Data
					</h1>
					<p className="text-muted-foreground">Download system data for analysis, backup, or integration</p>
				</div>
				<Button variant="outline" onClick={() => navigate("/data/exports/history")}>
					View Export History
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Create Export</CardTitle>
					<CardDescription>Select the data type and format for your export</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Export Type */}
					<div className="space-y-2">
						<Label>What do you want to export?</Label>
						<Select value={exportType} onValueChange={(v) => setExportType(v as ExportType)}>
							<SelectTrigger>
								<SelectValue placeholder="Select export type" />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(EXPORT_TYPE_LABELS).map(([key, label]) => (
									<SelectItem key={key} value={key}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Format Selection */}
					<div className="space-y-2">
						<Label>Export Format</Label>
						<RadioGroup
							value={format}
							onValueChange={(v) => setFormat(v as ExportFormat)}
							className="grid grid-cols-3 gap-4"
						>
							<div>
								<RadioGroupItem value="csv" id="csv" className="peer sr-only" />
								<Label
									htmlFor="csv"
									className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
								>
									<FileSpreadsheet className="mb-3 h-6 w-6" />
									CSV
								</Label>
							</div>
							<div>
								<RadioGroupItem value="excel" id="excel" className="peer sr-only" />
								<Label
									htmlFor="excel"
									className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
								>
									<FileSpreadsheet className="mb-3 h-6 w-6" />
									Excel
								</Label>
							</div>
							<div>
								<RadioGroupItem value="pdf" id="pdf" className="peer sr-only" />
								<Label
									htmlFor="pdf"
									className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
								>
									<FileText className="mb-3 h-6 w-6" />
									PDF
								</Label>
							</div>
						</RadioGroup>
					</div>

					{/* Date Range */}
					<div className="space-y-2">
						<Label className="flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							Date Range (Optional)
						</Label>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1">
								<Label className="text-xs text-muted-foreground">From</Label>
								<Input
									type="date"
									value={dateRange.start}
									onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
								/>
							</div>
							<div className="space-y-1">
								<Label className="text-xs text-muted-foreground">To</Label>
								<Input
									type="date"
									value={dateRange.end}
									onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
								/>
							</div>
						</div>
					</div>

					<Button onClick={handleExport} disabled={!exportType || createExport.isPending} className="w-full">
						{getFormatIcon(format)}
						<span className="ml-2">
							{createExport.isPending ? "Creating Export..." : `Export as ${format.toUpperCase()}`}
						</span>
					</Button>
				</CardContent>
			</Card>

			{/* Export Types Info */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Available Export Types</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1">
							<p className="font-medium">Employees</p>
							<p className="text-sm text-muted-foreground">All employee records with personal and employment details</p>
						</div>
						<div className="space-y-1">
							<p className="font-medium">Payroll History</p>
							<p className="text-sm text-muted-foreground">Historical payroll runs with totals and status</p>
						</div>
						<div className="space-y-1">
							<p className="font-medium">Payslips</p>
							<p className="text-sm text-muted-foreground">Individual payslip details with earnings and deductions</p>
						</div>
						<div className="space-y-1">
							<p className="font-medium">Leave Balances</p>
							<p className="text-sm text-muted-foreground">Current leave balances for all employees</p>
						</div>
						<div className="space-y-1">
							<p className="font-medium">Filings</p>
							<p className="text-sm text-muted-foreground">EMP201, UIF, and other statutory filing records</p>
						</div>
						<div className="space-y-1">
							<p className="font-medium">Audit Logs</p>
							<p className="text-sm text-muted-foreground">System activity and change history</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

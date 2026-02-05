import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowUpFromLine, Download, FileSpreadsheet, Upload } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { ImportType, ImportJob } from "@/types/data-operations";
import { IMPORT_TYPE_LABELS } from "@/types/data-operations";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export default function ImportDataPage() {
	const navigate = useNavigate();
	const [importType, setImportType] = useState<ImportType | "">("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const { data: recentJobs, isLoading } = useQuery({
		queryKey: ["import-jobs"],
		queryFn: async () => {
			const response = await axios.get("/api/data/imports");
			return response.data.data as ImportJob[];
		},
	});

	const validateImport = useMutation({
		mutationFn: async (formData: FormData) => {
			const response = await axios.post("/api/data/imports/validate", formData);
			return response.data;
		},
		onSuccess: (data) => {
			toast.success("File validated successfully");
			navigate(`/data/imports/preview?jobId=${data.data.jobId}`);
		},
		onError: () => {
			toast.error("Validation failed. Please check your file.");
		},
	});

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedFile(file);
		}
	};

	const handleUpload = () => {
		if (!importType || !selectedFile) {
			toast.error("Please select import type and file");
			return;
		}

		const formData = new FormData();
		formData.append("type", importType);
		formData.append("file", selectedFile);
		validateImport.mutate(formData);
	};

	const handleDownloadTemplate = (type: ImportType) => {
		toast.success(`Downloading ${IMPORT_TYPE_LABELS[type]} template...`);
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
				<Skeleton className="h-64" />
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div>
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<ArrowUpFromLine className="h-6 w-6" />
					Import Data
				</h1>
				<p className="text-muted-foreground">Upload bulk data into the system</p>
			</div>

			{/* Upload Section */}
			<Card>
				<CardHeader>
					<CardTitle>New Import</CardTitle>
					<CardDescription>Select the type of data you want to import and upload your file</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label>Import Type</Label>
							<Select value={importType} onValueChange={(v) => setImportType(v as ImportType)}>
								<SelectTrigger>
									<SelectValue placeholder="Select what to import" />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(IMPORT_TYPE_LABELS).map(([key, label]) => (
										<SelectItem key={key} value={key}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{importType && (
							<div className="space-y-2">
								<Label>Download Template</Label>
								<Button variant="outline" className="w-full" onClick={() => handleDownloadTemplate(importType)}>
									<Download className="h-4 w-4 mr-2" />
									{IMPORT_TYPE_LABELS[importType]} Template
								</Button>
							</div>
						)}
					</div>

					{importType && (
						<div className="space-y-4">
							<div className="border-2 border-dashed rounded-lg p-8 text-center">
								<FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
								<div className="space-y-2">
									<Label htmlFor="file-upload" className="cursor-pointer">
										<span className="text-primary hover:underline">Click to upload</span>
										{" or drag and drop"}
									</Label>
									<Input
										id="file-upload"
										type="file"
										accept=".csv,.xlsx,.xls"
										onChange={handleFileChange}
										className="hidden"
									/>
									<p className="text-xs text-muted-foreground">CSV or Excel files only</p>
								</div>
								{selectedFile && (
									<div className="mt-4 p-3 bg-muted rounded-lg inline-flex items-center gap-2">
										<FileSpreadsheet className="h-4 w-4" />
										<span className="text-sm font-medium">{selectedFile.name}</span>
										<span className="text-xs text-muted-foreground">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
									</div>
								)}
							</div>

							<Button onClick={handleUpload} disabled={!selectedFile || validateImport.isPending} className="w-full">
								<Upload className="h-4 w-4 mr-2" />
								{validateImport.isPending ? "Validating..." : "Validate & Preview"}
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Recent Imports */}
			<Card>
				<CardHeader>
					<CardTitle>Import History</CardTitle>
					<CardDescription>Previous import jobs</CardDescription>
				</CardHeader>
				<CardContent>
					{recentJobs && recentJobs.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Type</TableHead>
									<TableHead>File</TableHead>
									<TableHead className="text-center">Rows</TableHead>
									<TableHead className="text-center">Valid</TableHead>
									<TableHead className="text-center">Errors</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Uploaded</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{recentJobs.map((job) => (
									<TableRow key={job.id}>
										<TableCell className="font-medium">{job.typeLabel}</TableCell>
										<TableCell className="text-muted-foreground">{job.fileName}</TableCell>
										<TableCell className="text-center">{job.totalRows}</TableCell>
										<TableCell className="text-center text-green-600">{job.validRows}</TableCell>
										<TableCell className="text-center text-destructive">{job.errorRows}</TableCell>
										<TableCell>{getStatusBadge(job.status)}</TableCell>
										<TableCell className="text-muted-foreground">
											{new Date(job.uploadedAt).toLocaleDateString()}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-muted-foreground text-center py-8">No import history</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

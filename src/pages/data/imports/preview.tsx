import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, ArrowLeft, CheckCircle, FileCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import type { ImportPreview } from "@/types/data-operations";
import { Alert, AlertDescription } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

export default function ImportPreviewPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [searchParams] = useSearchParams();
	const jobId = searchParams.get("jobId");
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

	const { data: preview, isLoading } = useQuery({
		queryKey: ["import-preview", jobId],
		queryFn: async () => {
			const response = await axios.get(`/api/data/imports/preview?jobId=${jobId}`);
			return response.data.data as ImportPreview;
		},
		enabled: !!jobId,
	});

	const commitImport = useMutation({
		mutationFn: async () => {
			const response = await axios.post("/api/data/imports/commit", { jobId });
			return response.data;
		},
		onSuccess: () => {
			toast.success("Import committed successfully");
			queryClient.invalidateQueries({ queryKey: ["import-jobs"] });
			navigate("/data/imports");
		},
		onError: () => {
			toast.error("Failed to commit import");
		},
	});

	const handleCommit = () => {
		setConfirmDialogOpen(false);
		commitImport.mutate();
	};

	const errors = preview?.validationResults.filter((r) => r.severity === "error") || [];
	const warnings = preview?.validationResults.filter((r) => r.severity === "warning") || [];

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-96" />
			</div>
		);
	}

	if (!preview) {
		return (
			<div className="p-6 text-center">
				<p className="text-muted-foreground">Import preview not found</p>
				<Button variant="outline" onClick={() => navigate("/data/imports")} className="mt-4">
					Back to Imports
				</Button>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => navigate("/data/imports")}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold flex items-center gap-2">
							<FileCheck className="h-6 w-6" />
							Import Preview
						</h1>
						<p className="text-muted-foreground">
							{preview.typeLabel} - {preview.fileName}
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => navigate("/data/imports")}>
						Cancel
					</Button>
					<Button onClick={() => setConfirmDialogOpen(true)} disabled={!preview.canCommit || commitImport.isPending}>
						{commitImport.isPending ? "Committing..." : "Commit Import"}
					</Button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Total Rows</CardDescription>
						<CardTitle className="text-2xl">{preview.totalRows}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-1">
							<CheckCircle className="h-3 w-3 text-green-600" />
							Valid Rows
						</CardDescription>
						<CardTitle className="text-2xl text-green-600">{preview.validRows}</CardTitle>
					</CardHeader>
				</Card>
				<Card className={preview.errorCount > 0 ? "border-destructive" : ""}>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-1">
							<XCircle className="h-3 w-3 text-destructive" />
							Errors
						</CardDescription>
						<CardTitle className="text-2xl text-destructive">{preview.errorCount}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-1">
							<AlertTriangle className="h-3 w-3 text-amber-600" />
							Warnings
						</CardDescription>
						<CardTitle className="text-2xl text-amber-600">{preview.warningCount}</CardTitle>
					</CardHeader>
				</Card>
			</div>

			{!preview.canCommit && (
				<Alert variant="destructive">
					<XCircle className="h-4 w-4" />
					<AlertDescription>
						This import has blocking errors that must be resolved before committing. Please fix the errors and re-upload
						your file.
					</AlertDescription>
				</Alert>
			)}

			{preview.canCommit && preview.warningCount > 0 && (
				<Alert>
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>
						This import has warnings. You can proceed, but please review them carefully.
					</AlertDescription>
				</Alert>
			)}

			<Tabs defaultValue="preview">
				<TabsList>
					<TabsTrigger value="preview">Data Preview</TabsTrigger>
					<TabsTrigger value="errors" className="gap-2">
						Errors
						{errors.length > 0 && (
							<Badge variant="destructive" className="text-xs">
								{errors.length}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="warnings" className="gap-2">
						Warnings
						{warnings.length > 0 && (
							<Badge variant="secondary" className="text-xs">
								{warnings.length}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="preview">
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Data Preview</CardTitle>
							<CardDescription>First 10 rows of your import</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Row</TableHead>
											{preview.previewData[0] &&
												Object.keys(preview.previewData[0]).map((key) => <TableHead key={key}>{key}</TableHead>)}
										</TableRow>
									</TableHeader>
									<TableBody>
										{preview.previewData.slice(0, 10).map((row, index) => (
											<TableRow key={`row-${index}`}>
												<TableCell className="font-medium">{index + 1}</TableCell>
												{Object.values(row).map((value, cellIndex) => (
													<TableCell key={`cell-${index}-${cellIndex}`}>{String(value)}</TableCell>
												))}
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="errors">
					<Card>
						<CardHeader>
							<CardTitle className="text-base text-destructive">Validation Errors</CardTitle>
							<CardDescription>These must be fixed before importing</CardDescription>
						</CardHeader>
						<CardContent>
							{errors.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Row</TableHead>
											<TableHead>Field</TableHead>
											<TableHead>Value</TableHead>
											<TableHead>Error</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{errors.map((error, index) => (
											<TableRow key={`error-${error.row}-${error.field}-${index}`}>
												<TableCell className="font-medium">{error.row}</TableCell>
												<TableCell>{error.field}</TableCell>
												<TableCell className="text-muted-foreground">{error.value}</TableCell>
												<TableCell className="text-destructive">{error.message}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<p className="text-muted-foreground text-center py-8">No errors found</p>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="warnings">
					<Card>
						<CardHeader>
							<CardTitle className="text-base text-amber-600">Warnings</CardTitle>
							<CardDescription>Review these before proceeding</CardDescription>
						</CardHeader>
						<CardContent>
							{warnings.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Row</TableHead>
											<TableHead>Field</TableHead>
											<TableHead>Value</TableHead>
											<TableHead>Warning</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{warnings.map((warning, index) => (
											<TableRow key={`warning-${warning.row}-${warning.field}-${index}`}>
												<TableCell className="font-medium">{warning.row}</TableCell>
												<TableCell>{warning.field}</TableCell>
												<TableCell className="text-muted-foreground">{warning.value}</TableCell>
												<TableCell className="text-amber-600">{warning.message}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<p className="text-muted-foreground text-center py-8">No warnings</p>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Confirm Dialog */}
			<Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Import</DialogTitle>
						<DialogDescription>
							You are about to import {preview.validRows} records. This action will:
						</DialogDescription>
					</DialogHeader>
					<ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
						<li>Write data to the database</li>
						<li>Create audit log entries</li>
						<li>Trigger dependent recalculations if applicable</li>
					</ul>
					{preview.warningCount > 0 && (
						<Alert>
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>
								This import has {preview.warningCount} warning(s). Please ensure you have reviewed them.
							</AlertDescription>
						</Alert>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleCommit}>Confirm & Import</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

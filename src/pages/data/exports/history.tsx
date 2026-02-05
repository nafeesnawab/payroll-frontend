import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowDownToLine, Download, FileSpreadsheet, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { ExportJob } from "@/types/data-operations";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export default function ExportHistoryPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: exports, isLoading } = useQuery({
		queryKey: ["export-history"],
		queryFn: async () => {
			const response = await axios.get("/api/data/exports/history");
			return response.data.data as ExportJob[];
		},
	});

	const regenerateExport = useMutation({
		mutationFn: async (id: string) => {
			const response = await axios.post(`/api/data/exports/${id}/regenerate`);
			return response.data;
		},
		onSuccess: () => {
			toast.success("Export regeneration started");
			queryClient.invalidateQueries({ queryKey: ["export-history"] });
		},
		onError: () => {
			toast.error("Failed to regenerate export");
		},
	});

	const handleDownload = (job: ExportJob) => {
		if (job.downloadUrl) {
			toast.success(`Downloading ${job.typeLabel}...`);
		}
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

	const formatFileSize = (bytes?: number) => {
		if (!bytes) return "-";
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<ArrowDownToLine className="h-6 w-6" />
						Export History
					</h1>
					<p className="text-muted-foreground">
						Track and download previous exports
					</p>
				</div>
				<Button onClick={() => navigate("/data/exports")}>
					<FileSpreadsheet className="h-4 w-4 mr-2" />
					New Export
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Exports</CardTitle>
					<CardDescription>
						Download links are available for 7 days after generation
					</CardDescription>
				</CardHeader>
				<CardContent>
					{exports && exports.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Type</TableHead>
									<TableHead>Format</TableHead>
									<TableHead>Date Range</TableHead>
									<TableHead>Records</TableHead>
									<TableHead>Size</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Requested</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{exports.map((job) => (
									<TableRow key={job.id}>
										<TableCell className="font-medium">{job.typeLabel}</TableCell>
										<TableCell className="uppercase">{job.format}</TableCell>
										<TableCell className="text-muted-foreground">
											{job.dateRange
												? `${new Date(job.dateRange.start).toLocaleDateString()} - ${new Date(job.dateRange.end).toLocaleDateString()}`
												: "All time"}
										</TableCell>
										<TableCell>{job.recordCount ?? "-"}</TableCell>
										<TableCell>{formatFileSize(job.fileSize)}</TableCell>
										<TableCell>{getStatusBadge(job.status)}</TableCell>
										<TableCell className="text-muted-foreground">
											{new Date(job.requestedAt).toLocaleString()}
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												{job.status === "completed" && job.downloadUrl && (
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleDownload(job)}
													>
														<Download className="h-4 w-4" />
													</Button>
												)}
												<Button
													variant="ghost"
													size="sm"
													onClick={() => regenerateExport.mutate(job.id)}
													disabled={regenerateExport.isPending}
												>
													<RefreshCw className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-muted-foreground text-center py-8">No export history</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

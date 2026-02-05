import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Activity, AlertTriangle, CheckCircle, Play, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { BackgroundJob } from "@/types/admin";
import { JOB_TYPE_LABELS } from "@/types/admin";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Progress } from "@/ui/progress";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export default function SystemMonitoringPage() {
	const queryClient = useQueryClient();

	const { data: jobs, isLoading } = useQuery({
		queryKey: ["admin-jobs"],
		queryFn: async () => {
			const response = await axios.get("/api/admin/jobs");
			return response.data.data as BackgroundJob[];
		},
		refetchInterval: 5000,
	});

	const retryJob = useMutation({
		mutationFn: async (id: string) => {
			const response = await axios.post(`/api/admin/jobs/${id}/retry`);
			return response.data;
		},
		onSuccess: () => {
			toast.success("Job retry initiated");
			queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
		},
		onError: () => {
			toast.error("Failed to retry job");
		},
	});

	const cancelJob = useMutation({
		mutationFn: async (id: string) => {
			const response = await axios.post(`/api/admin/jobs/${id}/cancel`);
			return response.data;
		},
		onSuccess: () => {
			toast.success("Job cancelled");
			queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
		},
		onError: () => {
			toast.error("Failed to cancel job");
		},
	});

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "completed":
				return (
					<Badge className="bg-green-100 text-green-800 gap-1">
						<CheckCircle className="h-3 w-3" />
						Completed
					</Badge>
				);
			case "running":
				return (
					<Badge className="bg-blue-100 text-blue-800 gap-1">
						<Play className="h-3 w-3" />
						Running
					</Badge>
				);
			case "pending":
				return <Badge variant="secondary">Pending</Badge>;
			case "failed":
				return (
					<Badge variant="destructive" className="gap-1">
						<XCircle className="h-3 w-3" />
						Failed
					</Badge>
				);
			case "cancelled":
				return <Badge variant="outline">Cancelled</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const runningJobs = jobs?.filter((j) => j.status === "running").length ?? 0;
	const pendingJobs = jobs?.filter((j) => j.status === "pending").length ?? 0;
	const failedJobs = jobs?.filter((j) => j.status === "failed").length ?? 0;

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
						<Activity className="h-6 w-6" />
						System Monitoring
					</h1>
					<p className="text-muted-foreground">Background jobs and system health</p>
				</div>
				<Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-jobs"] })}>
					<RefreshCw className="h-4 w-4 mr-2" />
					Refresh
				</Button>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<Play className="h-4 w-4 text-blue-600" />
							Running
						</CardDescription>
						<CardTitle className="text-3xl text-blue-600">{runningJobs}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Pending</CardDescription>
						<CardTitle className="text-3xl">{pendingJobs}</CardTitle>
					</CardHeader>
				</Card>
				<Card className={failedJobs > 0 ? "border-destructive" : ""}>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<AlertTriangle className="h-4 w-4 text-destructive" />
							Failed
						</CardDescription>
						<CardTitle className="text-3xl text-destructive">{failedJobs}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Total Jobs</CardDescription>
						<CardTitle className="text-3xl">{jobs?.length ?? 0}</CardTitle>
					</CardHeader>
				</Card>
			</div>

			{/* Jobs Table */}
			<Card>
				<CardHeader>
					<CardTitle>Background Jobs</CardTitle>
					<CardDescription>All background processing tasks</CardDescription>
				</CardHeader>
				<CardContent>
					{jobs && jobs.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Type</TableHead>
									<TableHead>Company</TableHead>
									<TableHead>Progress</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Started</TableHead>
									<TableHead>Retries</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{jobs.map((job) => (
									<TableRow key={job.id}>
										<TableCell className="font-medium">{JOB_TYPE_LABELS[job.type]}</TableCell>
										<TableCell className="text-muted-foreground">{job.companyName}</TableCell>
										<TableCell className="w-32">
											{job.status === "running" ? (
												<div className="space-y-1">
													<Progress value={job.progress} className="h-2" />
													<p className="text-xs text-muted-foreground">{job.progress}%</p>
												</div>
											) : job.status === "completed" ? (
												<span className="text-green-600">100%</span>
											) : (
												<span className="text-muted-foreground">-</span>
											)}
										</TableCell>
										<TableCell>
											{getStatusBadge(job.status)}
											{job.errorMessage && (
												<p className="text-xs text-destructive mt-1 max-w-xs truncate">{job.errorMessage}</p>
											)}
										</TableCell>
										<TableCell className="text-muted-foreground">{new Date(job.startedAt).toLocaleString()}</TableCell>
										<TableCell className="text-center">{job.retryCount}</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												{job.status === "failed" && (
													<Button variant="outline" size="sm" onClick={() => retryJob.mutate(job.id)}>
														<RefreshCw className="h-3 w-3 mr-1" />
														Retry
													</Button>
												)}
												{(job.status === "running" || job.status === "pending") && (
													<Button variant="ghost" size="sm" onClick={() => cancelJob.mutate(job.id)}>
														Cancel
													</Button>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-muted-foreground text-center py-8">No background jobs</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

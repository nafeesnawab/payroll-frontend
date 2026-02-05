import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import type { EMP201Detail } from "@/types/filing";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AlertCircle, AlertTriangle, ArrowLeft, Check, Clock, Download, FileText, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
	draft: { label: "Draft", variant: "secondary" },
	ready: { label: "Ready", variant: "outline" },
	submitted: { label: "Submitted", variant: "default" },
	accepted: { label: "Accepted", variant: "default" },
	rejected: { label: "Rejected", variant: "destructive" },
};

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);
}

export default function EMP201DetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

	const { data: detail, isLoading } = useQuery({
		queryKey: ["emp201-detail", id],
		queryFn: async () => {
			const response = await axios.get(`/api/filings/emp201/${id}`);
			return response.data.data as EMP201Detail;
		},
	});

	const submitMutation = useMutation({
		mutationFn: async () => axios.post(`/api/filings/emp201/${id}/submit`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["emp201-detail", id] });
			queryClient.invalidateQueries({ queryKey: ["emp201-list"] });
			setSubmitDialogOpen(false);
			toast.success("EMP201 marked as submitted");
		},
	});

	const hasErrors = detail?.validation.errors && detail.validation.errors.length > 0;
	const hasWarnings = detail?.validation.warnings && detail.validation.warnings.length > 0;
	const canSubmit = detail?.status === "ready" && !hasErrors;
	const isLocked = detail?.status === "submitted" || detail?.status === "accepted";

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-10 w-64" />
				<div className="grid gap-4 md:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-32" />
					))}
				</div>
				<Skeleton className="h-64" />
			</div>
		);
	}

	if (!detail) {
		return (
			<div className="p-6">
				<p>EMP201 not found</p>
			</div>
		);
	}

	const status = statusConfig[detail.status];

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => navigate("/filings/emp201")}>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold flex items-center gap-2">
							<FileText className="h-6 w-6" />
							EMP201 - {detail.period}
						</h1>
						<p className="text-muted-foreground">{detail.totalEmployees} employees included</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<Badge variant={status.variant} className="text-sm px-3 py-1">
						{status.label}
					</Badge>
					{isLocked && (
						<Button variant="outline">
							<Download className="h-4 w-4 mr-2" />
							Download
						</Button>
					)}
					{canSubmit && (
						<Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
							<DialogTrigger asChild>
								<Button>
									<Send className="h-4 w-4 mr-2" />
									Mark as Submitted
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Submit EMP201</DialogTitle>
									<DialogDescription>
										Mark this EMP201 as submitted to SARS. This will lock the declaration and prevent further changes.
									</DialogDescription>
								</DialogHeader>
								<div className="flex justify-end gap-2 mt-4">
									<Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>
										Cancel
									</Button>
									<Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
										{submitMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
										Confirm Submission
									</Button>
								</div>
							</DialogContent>
						</Dialog>
					)}
				</div>
			</div>

			{hasErrors && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Validation Errors</AlertTitle>
					<AlertDescription>
						<ul className="list-disc list-inside mt-2">
							{detail.validation.errors.map((err, i) => (
								<li key={`err-${err.code}-${i}`}>{err.message}</li>
							))}
						</ul>
					</AlertDescription>
				</Alert>
			)}

			{hasWarnings && !hasErrors && (
				<Alert>
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Warnings</AlertTitle>
					<AlertDescription>
						<ul className="list-disc list-inside mt-2">
							{detail.validation.warnings.map((warn, i) => (
								<li key={`warn-${warn.code}-${i}`}>{warn.message}</li>
							))}
						</ul>
					</AlertDescription>
				</Alert>
			)}

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Total PAYE</CardDescription>
						<CardTitle className="text-3xl">{formatCurrency(detail.totalPaye)}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Total UIF</CardDescription>
						<CardTitle className="text-3xl">{formatCurrency(detail.totalUif)}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Total SDL</CardDescription>
						<CardTitle className="text-3xl">{formatCurrency(detail.totalSdl)}</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Included Payruns</CardTitle>
					<CardDescription>Payroll runs contributing to this EMP201</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Payrun</TableHead>
								<TableHead>Period</TableHead>
								<TableHead className="text-right">PAYE</TableHead>
								<TableHead className="text-right">UIF</TableHead>
								<TableHead className="text-right">SDL</TableHead>
								<TableHead className="text-right">Employees</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{detail.payruns.map((pr) => (
								<TableRow key={pr.id}>
									<TableCell className="font-medium">{pr.name}</TableCell>
									<TableCell>
										{pr.periodStart} to {pr.periodEnd}
									</TableCell>
									<TableCell className="text-right font-mono">{formatCurrency(pr.paye)}</TableCell>
									<TableCell className="text-right font-mono">{formatCurrency(pr.uif)}</TableCell>
									<TableCell className="text-right font-mono">{formatCurrency(pr.sdl)}</TableCell>
									<TableCell className="text-right">{pr.employeeCount}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Audit Log</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{detail.auditLog.map((entry) => (
							<div key={entry.id} className="flex items-start gap-3 text-sm">
								<div className="mt-0.5">
									{entry.action === "Submitted" ? (
										<Check className="h-4 w-4 text-green-600" />
									) : (
										<Clock className="h-4 w-4 text-muted-foreground" />
									)}
								</div>
								<div>
									<p className="font-medium">{entry.action}</p>
									<p className="text-muted-foreground">
										{entry.user} • {new Date(entry.timestamp).toLocaleString()}
									</p>
									{entry.notes && <p className="text-muted-foreground">{entry.notes}</p>}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

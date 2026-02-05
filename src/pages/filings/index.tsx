import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import type { FilingOverview } from "@/types/filing";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
	AlertCircle,
	AlertTriangle,
	ArrowRight,
	Building2,
	ExternalLink,
	FileCheck,
	FileSpreadsheet,
	FileText,
	Info,
	Users,
} from "lucide-react";
import { useNavigate } from "react-router";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
	draft: { label: "Draft", variant: "secondary" },
	ready: { label: "Ready", variant: "outline" },
	submitted: { label: "Submitted", variant: "default" },
	accepted: { label: "Accepted", variant: "default" },
	rejected: { label: "Rejected", variant: "destructive" },
	pending: { label: "Pending", variant: "secondary" },
	in_progress: { label: "In Progress", variant: "outline" },
	completed: { label: "Completed", variant: "default" },
};

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);
}

export default function FilingsDashboard() {
	const navigate = useNavigate();

	const { data: overview, isLoading } = useQuery({
		queryKey: ["filings-overview"],
		queryFn: async () => {
			const response = await axios.get("/api/filings/overview");
			return response.data.data as FilingOverview;
		},
	});

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-10 w-64" />
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-40" />
					))}
				</div>
				<Skeleton className="h-48" />
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div>
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<Building2 className="h-6 w-6" />
					Statutory Filings
				</h1>
				<p className="text-muted-foreground">Manage SARS, UIF, and SDL compliance submissions</p>
			</div>

			{overview?.alerts && overview.alerts.length > 0 && (
				<div className="space-y-3">
					{overview.alerts.map((alert) => (
						<Alert key={alert.id} variant={alert.type === "error" ? "destructive" : "default"}>
							{alert.type === "error" && <AlertCircle className="h-4 w-4" />}
							{alert.type === "warning" && <AlertTriangle className="h-4 w-4" />}
							{alert.type === "info" && <Info className="h-4 w-4" />}
							<AlertTitle>{alert.title}</AlertTitle>
							<AlertDescription>{alert.message}</AlertDescription>
						</Alert>
					))}
				</div>
			)}

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card
					className="cursor-pointer hover:border-primary transition-colors"
					onClick={() => navigate("/filings/emp201")}
				>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<FileText className="h-5 w-5 text-blue-600" />
							<Badge variant={statusConfig[overview?.emp201.status || "draft"].variant}>
								{statusConfig[overview?.emp201.status || "draft"].label}
							</Badge>
						</div>
						<CardTitle className="text-lg">EMP201</CardTitle>
						<CardDescription>Monthly Declaration</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm font-medium">{overview?.emp201.currentPeriod}</p>
						<p className="text-2xl font-bold mt-1">{formatCurrency(overview?.emp201.totalPaye || 0)}</p>
						<p className="text-xs text-muted-foreground">Total PAYE</p>
						<p className="text-xs text-muted-foreground mt-2">Due: {overview?.emp201.dueDate}</p>
					</CardContent>
				</Card>

				<Card
					className="cursor-pointer hover:border-primary transition-colors"
					onClick={() => navigate("/filings/emp501")}
				>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<FileSpreadsheet className="h-5 w-5 text-green-600" />
							<Badge variant={statusConfig[overview?.emp501.status || "draft"].variant}>
								{statusConfig[overview?.emp501.status || "draft"].label}
							</Badge>
						</div>
						<CardTitle className="text-lg">EMP501</CardTitle>
						<CardDescription>Bi-Annual Reconciliation</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm font-medium">
							{overview?.emp501.taxYear} - {overview?.emp501.type === "interim" ? "Interim" : "Final"}
						</p>
						<p className="text-xs text-muted-foreground mt-2">Due: {overview?.emp501.dueDate}</p>
					</CardContent>
				</Card>

				<Card
					className="cursor-pointer hover:border-primary transition-colors"
					onClick={() => navigate("/filings/irp5")}
				>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<FileCheck className="h-5 w-5 text-purple-600" />
							<Badge variant={statusConfig[overview?.irp5.status || "pending"].variant}>
								{statusConfig[overview?.irp5.status || "pending"].label}
							</Badge>
						</div>
						<CardTitle className="text-lg">IRP5 / IT3(a)</CardTitle>
						<CardDescription>Tax Certificates</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm font-medium">{overview?.irp5.taxYear} Tax Year</p>
						<p className="text-2xl font-bold mt-1">
							{overview?.irp5.generatedCount}/{overview?.irp5.totalCertificates}
						</p>
						<p className="text-xs text-muted-foreground">Certificates Generated</p>
					</CardContent>
				</Card>

				<Card
					className="cursor-pointer hover:border-primary transition-colors"
					onClick={() => navigate("/filings/uif")}
				>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<Users className="h-5 w-5 text-orange-600" />
							{overview?.uif.pendingDeclarations && overview.uif.pendingDeclarations > 0 ? (
								<Badge variant="secondary">{overview.uif.pendingDeclarations} Pending</Badge>
							) : (
								<Badge variant="default">Up to Date</Badge>
							)}
						</div>
						<CardTitle className="text-lg">UIF Declarations</CardTitle>
						<CardDescription>UI-19 / UI-2.7</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm font-medium">Employee Declarations</p>
						{overview?.uif.lastSubmission && (
							<p className="text-xs text-muted-foreground mt-2">
								Last submission: {new Date(overview.uif.lastSubmission).toLocaleDateString()}
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-3 md:grid-cols-2">
					<Button variant="outline" className="justify-between" onClick={() => navigate("/filings/emp201")}>
						View EMP201 Declarations
						<ArrowRight className="h-4 w-4" />
					</Button>
					<Button variant="outline" className="justify-between" onClick={() => navigate("/filings/emp501")}>
						EMP501 Reconciliation
						<ArrowRight className="h-4 w-4" />
					</Button>
					<Button variant="outline" className="justify-between" onClick={() => navigate("/filings/irp5")}>
						Generate Tax Certificates
						<ArrowRight className="h-4 w-4" />
					</Button>
					<Button variant="outline" className="justify-between" onClick={() => navigate("/filings/uif")}>
						Manage UIF Declarations
						<ArrowRight className="h-4 w-4" />
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>External Portals</CardTitle>
					<CardDescription>Direct links to government filing portals</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-3">
					<Button variant="outline" asChild>
						<a href="https://www.sarsefiling.co.za" target="_blank" rel="noopener noreferrer">
							SARS eFiling <ExternalLink className="h-4 w-4 ml-2" />
						</a>
					</Button>
					<Button variant="outline" asChild>
						<a href="https://www.ufiling.co.za" target="_blank" rel="noopener noreferrer">
							uFiling (UIF) <ExternalLink className="h-4 w-4 ml-2" />
						</a>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

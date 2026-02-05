import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, FileText, XCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

type ComplianceStatus = "draft" | "finalized" | "submitted" | "overdue" | "not_applicable";

interface ComplianceItem {
	status: ComplianceStatus;
	period: string;
	total: number;
	dueDate: string | null;
}

interface ComplianceData {
	emp201: ComplianceItem;
	uif: ComplianceItem;
	bargainingCouncil: ComplianceItem;
}

const statusConfig: Record<
	ComplianceStatus,
	{ label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2 }
> = {
	draft: { label: "Draft", variant: "secondary", icon: Clock },
	finalized: { label: "Finalized", variant: "default", icon: FileText },
	submitted: { label: "Submitted", variant: "default", icon: CheckCircle2 },
	overdue: { label: "Overdue", variant: "destructive", icon: AlertTriangle },
	not_applicable: { label: "N/A", variant: "outline", icon: XCircle },
};

const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("en-ZA", {
		style: "currency",
		currency: "ZAR",
		minimumFractionDigits: 0,
	}).format(amount);
};

function ComplianceRow({
	label,
	item,
	portalUrl,
	filingRoute,
}: {
	label: string;
	item: ComplianceItem;
	portalUrl?: string;
	filingRoute: string;
}) {
	const navigate = useNavigate();
	const config = statusConfig[item.status];
	const StatusIcon = config.icon;

	if (item.status === "not_applicable") {
		return null;
	}

	return (
		<div className="flex items-center justify-between py-3 border-b last:border-b-0">
			<div className="flex items-center gap-3">
				<div className={`p-2 rounded-lg ${item.status === "overdue" ? "bg-destructive/10" : "bg-primary/10"}`}>
					<StatusIcon className={`h-4 w-4 ${item.status === "overdue" ? "text-destructive" : "text-primary"}`} />
				</div>
				<div>
					<p className="font-medium">{label}</p>
					<p className="text-sm text-muted-foreground">{item.period}</p>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<div className="text-right">
					<p className="font-semibold">{formatCurrency(item.total)}</p>
					<Badge variant={config.variant} className="text-xs">
						{config.label}
					</Badge>
				</div>
				<div className="flex gap-1">
					<Button variant="ghost" size="icon" onClick={() => navigate(filingRoute)} title="Go to filing">
						<FileText className="h-4 w-4" />
					</Button>
					{portalUrl && (
						<Button variant="ghost" size="icon" asChild title="Open portal">
							<a href={portalUrl} target="_blank" rel="noopener noreferrer">
								<ExternalLink className="h-4 w-4" />
							</a>
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

export function ComplianceStatusWidget() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["dashboard", "compliance"],
		queryFn: async () => {
			const response = await axios.get("/api/dashboard/compliance");
			return response.data.data as ComplianceData;
		},
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Compliance Status
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{[1, 2].map((i) => (
						<div key={i} className="flex items-center justify-between py-3">
							<div className="flex items-center gap-3">
								<Skeleton className="h-10 w-10 rounded-lg" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-3 w-16" />
								</div>
							</div>
							<div className="space-y-2">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-5 w-16" />
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		);
	}

	if (error || !data) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Compliance Status
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Failed to load compliance data</p>
				</CardContent>
			</Card>
		);
	}

	const hasOverdue = data.emp201.status === "overdue" || data.uif.status === "overdue";

	return (
		<Card className={hasOverdue ? "border-destructive/50" : ""}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileText className={`h-5 w-5 ${hasOverdue ? "text-destructive" : ""}`} />
					Compliance Status
					{hasOverdue && (
						<Badge variant="destructive" className="ml-2">
							Action Required
						</Badge>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ComplianceRow
					label="EMP201"
					item={data.emp201}
					filingRoute="/filings/emp201"
					portalUrl="https://www.sarsefiling.co.za"
				/>
				<ComplianceRow
					label="UIF Declaration"
					item={data.uif}
					filingRoute="/filings/uif"
					portalUrl="https://www.ufiling.co.za"
				/>
				{data.bargainingCouncil.status !== "not_applicable" && (
					<ComplianceRow label="Bargaining Council" item={data.bargainingCouncil} filingRoute="/filings" />
				)}
			</CardContent>
		</Card>
	);
}

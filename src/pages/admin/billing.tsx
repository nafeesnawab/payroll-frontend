import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CreditCard, DollarSign, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import type { CompanyBilling } from "@/types/admin";
import { PLAN_LABELS } from "@/types/admin";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export default function BillingManagementPage() {
	const queryClient = useQueryClient();

	const { data: billings, isLoading } = useQuery({
		queryKey: ["admin-billing"],
		queryFn: async () => {
			const response = await axios.get("/api/admin/billing");
			return response.data.data as CompanyBilling[];
		},
	});

	const updateBilling = useMutation({
		mutationFn: async ({ companyId, action }: { companyId: string; action: string }) => {
			const response = await axios.put(`/api/admin/billing/${companyId}`, { action });
			return response.data;
		},
		onSuccess: () => {
			toast.success("Billing updated");
			queryClient.invalidateQueries({ queryKey: ["admin-billing"] });
		},
		onError: () => {
			toast.error("Failed to update billing");
		},
	});

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return <Badge className="bg-green-100 text-green-800">Active</Badge>;
			case "overdue":
				return <Badge className="bg-amber-100 text-amber-800">Overdue</Badge>;
			case "suspended":
				return <Badge variant="destructive">Suspended</Badge>;
			case "cancelled":
				return <Badge variant="outline">Cancelled</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const getPlanBadge = (plan: string) => {
		switch (plan) {
			case "enterprise":
				return <Badge className="bg-purple-100 text-purple-800">{PLAN_LABELS.enterprise}</Badge>;
			case "professional":
				return <Badge className="bg-blue-100 text-blue-800">{PLAN_LABELS.professional}</Badge>;
			case "starter":
				return <Badge variant="secondary">{PLAN_LABELS.starter}</Badge>;
			default:
				return <Badge variant="outline">{plan}</Badge>;
		}
	};

	const totalRevenue = billings?.reduce((sum, b) => sum + b.monthlyAmount, 0) ?? 0;
	const activeCount = billings?.filter((b) => b.status === "active").length ?? 0;
	const overdueCount = billings?.filter((b) => b.status === "overdue").length ?? 0;

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
					<CreditCard className="h-6 w-6" />
					Billing Management
				</h1>
				<p className="text-muted-foreground">Manage subscriptions and billing</p>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<DollarSign className="h-4 w-4" />
							Monthly Revenue
						</CardDescription>
						<CardTitle className="text-3xl">R {totalRevenue.toLocaleString()}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Active Subscriptions</CardDescription>
						<CardTitle className="text-3xl text-green-600">{activeCount}</CardTitle>
					</CardHeader>
				</Card>
				<Card className={overdueCount > 0 ? "border-amber-300" : ""}>
					<CardHeader className="pb-2">
						<CardDescription>Overdue</CardDescription>
						<CardTitle className="text-3xl text-amber-600">{overdueCount}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Total Companies</CardDescription>
						<CardTitle className="text-3xl">{billings?.length ?? 0}</CardTitle>
					</CardHeader>
				</Card>
			</div>

			{/* Billing Table */}
			<Card>
				<CardHeader>
					<CardTitle>Company Subscriptions</CardTitle>
					<CardDescription>Manage billing and subscription plans</CardDescription>
				</CardHeader>
				<CardContent>
					{billings && billings.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Company</TableHead>
									<TableHead>Plan</TableHead>
									<TableHead>Cycle</TableHead>
									<TableHead className="text-right">Monthly</TableHead>
									<TableHead className="text-center">Employees</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Next Billing</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{billings.map((billing) => (
									<TableRow key={billing.companyId}>
										<TableCell className="font-medium">{billing.companyName}</TableCell>
										<TableCell>{getPlanBadge(billing.plan)}</TableCell>
										<TableCell className="capitalize">{billing.billingCycle}</TableCell>
										<TableCell className="text-right">
											R {billing.monthlyAmount.toLocaleString()}
											{billing.discountPercent > 0 && (
												<span className="text-xs text-green-600 ml-1">(-{billing.discountPercent}%)</span>
											)}
										</TableCell>
										<TableCell className="text-center">{billing.usageMetrics.employees}</TableCell>
										<TableCell>{getStatusBadge(billing.status)}</TableCell>
										<TableCell className="text-muted-foreground">
											{new Date(billing.nextBillingDate).toLocaleDateString()}
										</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={() =>
															updateBilling.mutate({
																companyId: billing.companyId,
																action: "upgrade",
															})
														}
													>
														Upgrade Plan
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() =>
															updateBilling.mutate({
																companyId: billing.companyId,
																action: "downgrade",
															})
														}
													>
														Downgrade Plan
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() =>
															updateBilling.mutate({
																companyId: billing.companyId,
																action: "discount",
															})
														}
													>
														Apply Discount
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													{billing.status === "active" ? (
														<DropdownMenuItem
															className="text-destructive"
															onClick={() =>
																updateBilling.mutate({
																	companyId: billing.companyId,
																	action: "suspend",
																})
															}
														>
															Suspend Billing
														</DropdownMenuItem>
													) : (
														<DropdownMenuItem
															onClick={() =>
																updateBilling.mutate({
																	companyId: billing.companyId,
																	action: "reactivate",
																})
															}
														>
															Reactivate
														</DropdownMenuItem>
													)}
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-muted-foreground text-center py-8">No billing records</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

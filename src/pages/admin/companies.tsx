import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Building2, MoreHorizontal, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PlatformCompany } from "@/types/admin";
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
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export default function AdminCompaniesPage() {
	const queryClient = useQueryClient();
	const [searchTerm, setSearchTerm] = useState("");

	const { data: companies, isLoading } = useQuery({
		queryKey: ["admin-companies", searchTerm],
		queryFn: async () => {
			const response = await axios.get(`/api/admin/companies?search=${searchTerm}`);
			return response.data.data as PlatformCompany[];
		},
	});

	const suspendCompany = useMutation({
		mutationFn: async (id: string) => {
			const response = await axios.put(`/api/admin/companies/${id}`, { status: "suspended" });
			return response.data;
		},
		onSuccess: () => {
			toast.success("Company suspended");
			queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
		},
		onError: () => {
			toast.error("Failed to suspend company");
		},
	});

	const reactivateCompany = useMutation({
		mutationFn: async (id: string) => {
			const response = await axios.put(`/api/admin/companies/${id}`, { status: "active" });
			return response.data;
		},
		onSuccess: () => {
			toast.success("Company reactivated");
			queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
		},
		onError: () => {
			toast.error("Failed to reactivate company");
		},
	});

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return <Badge className="bg-green-100 text-green-800">Active</Badge>;
			case "suspended":
				return <Badge variant="destructive">Suspended</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const getBillingBadge = (status: string) => {
		switch (status) {
			case "active":
				return <Badge className="bg-green-100 text-green-800">Current</Badge>;
			case "overdue":
				return <Badge className="bg-amber-100 text-amber-800">Overdue</Badge>;
			case "suspended":
				return <Badge variant="destructive">Suspended</Badge>;
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
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Building2 className="h-6 w-6" />
						Company Search
					</h1>
					<p className="text-muted-foreground">Locate and manage customer companies</p>
				</div>
			</div>

			{/* Search */}
			<Card>
				<CardContent className="pt-6">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by company name, registration number, or PAYE reference..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-9"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Companies Table */}
			<Card>
				<CardHeader>
					<CardTitle>Companies</CardTitle>
					<CardDescription>{companies?.length ?? 0} companies found</CardDescription>
				</CardHeader>
				<CardContent>
					{companies && companies.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Company</TableHead>
									<TableHead>Registration</TableHead>
									<TableHead>PAYE Reference</TableHead>
									<TableHead>Plan</TableHead>
									<TableHead className="text-center">Employees</TableHead>
									<TableHead>Billing</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{companies.map((company) => (
									<TableRow key={company.id}>
										<TableCell className="font-medium">{company.name}</TableCell>
										<TableCell className="text-muted-foreground">{company.registrationNumber}</TableCell>
										<TableCell className="text-muted-foreground">{company.payeReference}</TableCell>
										<TableCell>
											<Badge variant="outline">{PLAN_LABELS[company.subscriptionPlan]}</Badge>
										</TableCell>
										<TableCell className="text-center">{company.employeeCount}</TableCell>
										<TableCell>{getBillingBadge(company.billingStatus)}</TableCell>
										<TableCell>{getStatusBadge(company.status)}</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem>View Details</DropdownMenuItem>
													<DropdownMenuItem>View Audit Logs</DropdownMenuItem>
													<DropdownMenuSeparator />
													{company.status === "active" ? (
														<DropdownMenuItem
															className="text-destructive"
															onClick={() => suspendCompany.mutate(company.id)}
														>
															Suspend Company
														</DropdownMenuItem>
													) : (
														<DropdownMenuItem onClick={() => reactivateCompany.mutate(company.id)}>
															Reactivate Company
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
						<p className="text-muted-foreground text-center py-8">
							{searchTerm ? "No companies match your search" : "No companies found"}
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

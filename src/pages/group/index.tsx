import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, Building2, DollarSign, Plus, Settings, Users } from "lucide-react";
import { useNavigate } from "react-router";
import type { GroupOverview, GroupCompany } from "@/types/group";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export default function GroupDashboardPage() {
	const navigate = useNavigate();

	const { data: overview, isLoading: loadingOverview } = useQuery({
		queryKey: ["group-overview"],
		queryFn: async () => {
			const response = await axios.get("/api/group/overview");
			return response.data.data as GroupOverview;
		},
	});

	const { data: companies, isLoading: loadingCompanies } = useQuery({
		queryKey: ["group-companies"],
		queryFn: async () => {
			const response = await axios.get("/api/group/companies");
			return response.data.data as GroupCompany[];
		},
	});

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return <Badge className="bg-green-100 text-green-800">Active</Badge>;
			case "suspended":
				return <Badge variant="destructive">Suspended</Badge>;
			case "pending":
				return <Badge variant="secondary">Pending</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	if (loadingOverview) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<div className="grid gap-4 md:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-32" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			{/* Group Context Banner */}
			<div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Building2 className="h-6 w-6 text-primary" />
					<div>
						<p className="font-medium">{overview?.groupName || "Group"}</p>
						<p className="text-sm text-muted-foreground">Group Management Context</p>
					</div>
				</div>
				<Button variant="outline" size="sm" onClick={() => navigate("/group/settings")}>
					<Settings className="h-4 w-4 mr-2" />
					Group Settings
				</Button>
			</div>

			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Building2 className="h-6 w-6" />
						Group Overview
					</h1>
					<p className="text-muted-foreground">
						Manage all companies in your group
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => navigate("/group/transfers")}>
						Transfer Employee
					</Button>
					<Button onClick={() => navigate("/group/companies")}>
						<Plus className="h-4 w-4 mr-2" />
						Add Company
					</Button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card
					className="cursor-pointer hover:shadow-md transition-shadow"
					onClick={() => navigate("/group/companies")}
				>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<Building2 className="h-4 w-4" />
							Total Companies
						</CardDescription>
						<CardTitle className="text-3xl">{overview?.totalCompanies ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">in this group</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							Total Employees
						</CardDescription>
						<CardTitle className="text-3xl">{overview?.totalEmployees ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">across all companies</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<DollarSign className="h-4 w-4" />
							Active Payrolls
						</CardDescription>
						<CardTitle className="text-3xl">{overview?.activePayrolls ?? 0}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">in progress</p>
					</CardContent>
				</Card>

				<Card className={overview?.complianceAlerts ? "border-amber-300" : ""}>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<AlertTriangle className="h-4 w-4 text-amber-600" />
							Compliance Alerts
						</CardDescription>
						<CardTitle className="text-3xl text-amber-600">
							{overview?.complianceAlerts ?? 0}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">require attention</p>
					</CardContent>
				</Card>
			</div>

			{/* Companies List */}
			<Card>
				<CardHeader>
					<CardTitle>Companies</CardTitle>
					<CardDescription>All companies in this group</CardDescription>
				</CardHeader>
				<CardContent>
					{loadingCompanies ? (
						<Skeleton className="h-48" />
					) : companies && companies.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Company</TableHead>
									<TableHead>Registration</TableHead>
									<TableHead className="text-center">Employees</TableHead>
									<TableHead>Last Payroll</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{companies.map((company) => (
									<TableRow key={company.id}>
										<TableCell>
											<div>
												<p className="font-medium">{company.tradingName}</p>
												<p className="text-xs text-muted-foreground">{company.legalName}</p>
											</div>
										</TableCell>
										<TableCell className="text-muted-foreground">
											{company.registrationNumber}
										</TableCell>
										<TableCell className="text-center">{company.employeeCount}</TableCell>
										<TableCell className="text-muted-foreground">
											{company.lastPayrollRun
												? new Date(company.lastPayrollRun).toLocaleDateString()
												: "Never"}
										</TableCell>
										<TableCell>{getStatusBadge(company.status)}</TableCell>
										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => navigate(`/group/companies/${company.id}`)}
											>
												Manage
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-muted-foreground text-center py-8">No companies in this group</p>
					)}
				</CardContent>
			</Card>

			{/* Quick Actions */}
			<div className="grid gap-4 md:grid-cols-3">
				<Button
					variant="outline"
					className="h-auto py-4 justify-start"
					onClick={() => navigate("/group/companies")}
				>
					<Building2 className="h-5 w-5 mr-3" />
					<div className="text-left">
						<p className="font-medium">Manage Companies</p>
						<p className="text-xs text-muted-foreground">Add, edit, or suspend companies</p>
					</div>
				</Button>
				<Button
					variant="outline"
					className="h-auto py-4 justify-start"
					onClick={() => navigate("/group/transfers")}
				>
					<Users className="h-5 w-5 mr-3" />
					<div className="text-left">
						<p className="font-medium">Employee Transfers</p>
						<p className="text-xs text-muted-foreground">Move employees between companies</p>
					</div>
				</Button>
				<Button
					variant="outline"
					className="h-auto py-4 justify-start"
					onClick={() => navigate("/group/settings")}
				>
					<Settings className="h-5 w-5 mr-3" />
					<div className="text-left">
						<p className="font-medium">Group Settings</p>
						<p className="text-xs text-muted-foreground">Shared configuration & inheritance</p>
					</div>
				</Button>
			</div>
		</div>
	);
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Building2, Edit, MoreHorizontal, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { GroupCompany, CreateCompanyInput } from "@/types/group";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export default function CompanyManagementPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [newCompany, setNewCompany] = useState<CreateCompanyInput>({
		legalName: "",
		tradingName: "",
		registrationNumber: "",
		payeNumber: "",
		uifNumber: "",
		sdlNumber: "",
	});

	const { data: companies, isLoading } = useQuery({
		queryKey: ["group-companies"],
		queryFn: async () => {
			const response = await axios.get("/api/group/companies");
			return response.data.data as GroupCompany[];
		},
	});

	const createCompany = useMutation({
		mutationFn: async (data: CreateCompanyInput) => {
			const response = await axios.post("/api/group/companies", data);
			return response.data;
		},
		onSuccess: () => {
			toast.success("Company created successfully");
			queryClient.invalidateQueries({ queryKey: ["group-companies"] });
			setAddDialogOpen(false);
			setNewCompany({
				legalName: "",
				tradingName: "",
				registrationNumber: "",
				payeNumber: "",
				uifNumber: "",
				sdlNumber: "",
			});
		},
		onError: () => {
			toast.error("Failed to create company");
		},
	});

	const suspendCompany = useMutation({
		mutationFn: async (id: string) => {
			const response = await axios.put(`/api/group/companies/${id}`, { status: "suspended" });
			return response.data;
		},
		onSuccess: () => {
			toast.success("Company suspended");
			queryClient.invalidateQueries({ queryKey: ["group-companies"] });
		},
		onError: () => {
			toast.error("Failed to suspend company");
		},
	});

	const activateCompany = useMutation({
		mutationFn: async (id: string) => {
			const response = await axios.put(`/api/group/companies/${id}`, { status: "active" });
			return response.data;
		},
		onSuccess: () => {
			toast.success("Company activated");
			queryClient.invalidateQueries({ queryKey: ["group-companies"] });
		},
		onError: () => {
			toast.error("Failed to activate company");
		},
	});

	const handleCreate = () => {
		if (!newCompany.legalName || !newCompany.registrationNumber) {
			toast.error("Please fill in required fields");
			return;
		}
		createCompany.mutate(newCompany);
	};

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
						Company Management
					</h1>
					<p className="text-muted-foreground">Create and manage companies in your group</p>
				</div>
				<Button onClick={() => setAddDialogOpen(true)}>
					<Plus className="h-4 w-4 mr-2" />
					Add Company
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Companies</CardTitle>
					<CardDescription>Each company has isolated payroll and filings with shared group settings</CardDescription>
				</CardHeader>
				<CardContent>
					{companies && companies.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Legal Name</TableHead>
									<TableHead>Trading Name</TableHead>
									<TableHead>Registration</TableHead>
									<TableHead>PAYE Number</TableHead>
									<TableHead className="text-center">Employees</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{companies.map((company) => (
									<TableRow key={company.id}>
										<TableCell className="font-medium">{company.legalName}</TableCell>
										<TableCell>{company.tradingName}</TableCell>
										<TableCell className="text-muted-foreground">{company.registrationNumber}</TableCell>
										<TableCell className="text-muted-foreground">{company.payeNumber}</TableCell>
										<TableCell className="text-center">{company.employeeCount}</TableCell>
										<TableCell>{getStatusBadge(company.status)}</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem onClick={() => navigate(`/group/companies/${company.id}`)}>
														<Edit className="h-4 w-4 mr-2" />
														Edit Details
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => navigate(`/group/companies/${company.id}/overrides`)}>
														View Overrides
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													{company.status === "active" ? (
														<DropdownMenuItem
															className="text-destructive"
															onClick={() => suspendCompany.mutate(company.id)}
														>
															Suspend Company
														</DropdownMenuItem>
													) : (
														<DropdownMenuItem onClick={() => activateCompany.mutate(company.id)}>
															Activate Company
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
						<p className="text-muted-foreground text-center py-8">No companies in this group yet</p>
					)}
				</CardContent>
			</Card>

			{/* Add Company Dialog */}
			<Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Add New Company</DialogTitle>
						<DialogDescription>Create a new company under this group</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="legalName">Legal Name *</Label>
								<Input
									id="legalName"
									value={newCompany.legalName}
									onChange={(e) => setNewCompany({ ...newCompany, legalName: e.target.value })}
									placeholder="Company (Pty) Ltd"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="tradingName">Trading Name</Label>
								<Input
									id="tradingName"
									value={newCompany.tradingName}
									onChange={(e) => setNewCompany({ ...newCompany, tradingName: e.target.value })}
									placeholder="Company"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="registrationNumber">Registration Number *</Label>
							<Input
								id="registrationNumber"
								value={newCompany.registrationNumber}
								onChange={(e) => setNewCompany({ ...newCompany, registrationNumber: e.target.value })}
								placeholder="2020/123456/07"
							/>
						</div>
						<div className="grid grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="payeNumber">PAYE Number</Label>
								<Input
									id="payeNumber"
									value={newCompany.payeNumber}
									onChange={(e) => setNewCompany({ ...newCompany, payeNumber: e.target.value })}
									placeholder="7123456789"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="uifNumber">UIF Number</Label>
								<Input
									id="uifNumber"
									value={newCompany.uifNumber}
									onChange={(e) => setNewCompany({ ...newCompany, uifNumber: e.target.value })}
									placeholder="U123456789"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="sdlNumber">SDL Number</Label>
								<Input
									id="sdlNumber"
									value={newCompany.sdlNumber}
									onChange={(e) => setNewCompany({ ...newCompany, sdlNumber: e.target.value })}
									placeholder="L123456789"
								/>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setAddDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleCreate} disabled={createCompany.isPending}>
							{createCompany.isPending ? "Creating..." : "Create Company"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

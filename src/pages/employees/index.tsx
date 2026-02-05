import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertCircle, Plus, Search, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import type { EmployeeListItem } from "@/types/employee";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
	active: { label: "Active", variant: "default" },
	inactive: { label: "Inactive", variant: "secondary" },
	terminated: { label: "Terminated", variant: "destructive" },
};

export default function EmployeesPage() {
	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	const { data, isLoading } = useQuery({
		queryKey: ["employees", { search, status: statusFilter }],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (search) params.set("search", search);
			if (statusFilter !== "all") params.set("status", statusFilter);
			const response = await axios.get(`/api/employees?${params.toString()}`);
			return response.data.data as EmployeeListItem[];
		},
	});

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Users className="h-6 w-6" />
						Employees
					</h1>
					<p className="text-muted-foreground">{data?.length ?? 0} employees</p>
				</div>
				<Button onClick={() => navigate("/employees/new")}>
					<Plus className="h-4 w-4 mr-2" />
					Add Employee
				</Button>
			</div>

			<Card>
				<CardContent className="pt-6">
					<div className="flex gap-4 mb-6">
						<div className="relative flex-1 max-w-sm">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search by name or number..."
								className="pl-9"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="inactive">Inactive</SelectItem>
								<SelectItem value="terminated">Terminated</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{isLoading ? (
						<div className="space-y-3">
							{[1, 2, 3, 4, 5].map((i) => (
								<Skeleton key={i} className="h-12 w-full" />
							))}
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Employee #</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Pay Frequency</TableHead>
									<TableHead>Pay Point</TableHead>
									<TableHead>Job Grade</TableHead>
									<TableHead className="w-12"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data?.map((employee) => {
									const status = statusConfig[employee.status];
									return (
										<TableRow
											key={employee.id}
											className="cursor-pointer hover:bg-muted/50"
											onClick={() => navigate(`/employees/${employee.id}`)}
										>
											<TableCell className="font-mono">{employee.employeeNumber}</TableCell>
											<TableCell className="font-medium">{employee.fullName}</TableCell>
											<TableCell>
												<Badge variant={status.variant}>{status.label}</Badge>
											</TableCell>
											<TableCell>{employee.payFrequencyName}</TableCell>
											<TableCell>{employee.payPointName}</TableCell>
											<TableCell>{employee.jobGradeName}</TableCell>
											<TableCell>
												{employee.hasErrors && <AlertCircle className="h-4 w-4 text-destructive" />}
											</TableCell>
										</TableRow>
									);
								})}
								{data?.length === 0 && (
									<TableRow>
										<TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
											No employees found
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

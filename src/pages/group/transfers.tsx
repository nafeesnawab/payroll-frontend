import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, ArrowRight, CheckCircle, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { CreateTransferInput, EmployeeTransfer, GroupCompany, TransferImpact } from "@/types/group";
import { Alert, AlertDescription } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Separator } from "@/ui/separator";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

interface MockEmployee {
	id: string;
	name: string;
	employeeNumber: string;
	companyId: string;
}

export default function EmployeeTransfersPage() {
	const queryClient = useQueryClient();
	const [transferDialogOpen, setTransferDialogOpen] = useState(false);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [selectedEmployee, setSelectedEmployee] = useState<string>("");
	const [sourceCompany, setSourceCompany] = useState<string>("");
	const [destinationCompany, setDestinationCompany] = useState<string>("");
	const [effectiveDate, setEffectiveDate] = useState<string>("");
	const [options, setOptions] = useState({
		preserveLeaveBalances: true,
		preserveServiceDate: true,
		resetTaxYear: false,
	});
	const [impact, setImpact] = useState<TransferImpact | null>(null);

	const { data: companies } = useQuery({
		queryKey: ["group-companies"],
		queryFn: async () => {
			const response = await axios.get("/api/group/companies");
			return response.data.data as GroupCompany[];
		},
	});

	const { data: transfers, isLoading } = useQuery({
		queryKey: ["employee-transfers"],
		queryFn: async () => {
			const response = await axios.get("/api/group/transfers");
			return response.data.data as EmployeeTransfer[];
		},
	});

	const { data: employees } = useQuery({
		queryKey: ["transfer-employees", sourceCompany],
		queryFn: async () => {
			const response = await axios.get(`/api/group/transfers/employees?companyId=${sourceCompany}`);
			return response.data.data as MockEmployee[];
		},
		enabled: !!sourceCompany,
	});

	const previewTransfer = useMutation({
		mutationFn: async () => {
			const response = await axios.post("/api/group/transfers/preview", {
				employeeId: selectedEmployee,
				sourceCompanyId: sourceCompany,
				destinationCompanyId: destinationCompany,
			});
			return response.data.data as TransferImpact;
		},
		onSuccess: (data) => {
			setImpact(data);
			setConfirmDialogOpen(true);
		},
		onError: () => {
			toast.error("Failed to preview transfer");
		},
	});

	const executeTransfer = useMutation({
		mutationFn: async (data: CreateTransferInput) => {
			const response = await axios.post("/api/group/transfers", data);
			return response.data;
		},
		onSuccess: () => {
			toast.success("Employee transfer completed");
			queryClient.invalidateQueries({ queryKey: ["employee-transfers"] });
			setConfirmDialogOpen(false);
			setTransferDialogOpen(false);
			resetForm();
		},
		onError: () => {
			toast.error("Failed to transfer employee");
		},
	});

	const resetForm = () => {
		setSelectedEmployee("");
		setSourceCompany("");
		setDestinationCompany("");
		setEffectiveDate("");
		setOptions({
			preserveLeaveBalances: true,
			preserveServiceDate: true,
			resetTaxYear: false,
		});
		setImpact(null);
	};

	const handlePreview = () => {
		if (!selectedEmployee || !sourceCompany || !destinationCompany || !effectiveDate) {
			toast.error("Please fill in all required fields");
			return;
		}
		if (sourceCompany === destinationCompany) {
			toast.error("Source and destination must be different");
			return;
		}
		previewTransfer.mutate();
	};

	const handleConfirmTransfer = () => {
		executeTransfer.mutate({
			employeeId: selectedEmployee,
			sourceCompanyId: sourceCompany,
			destinationCompanyId: destinationCompany,
			effectiveDate,
			...options,
		});
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "completed":
				return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
			case "pending":
				return <Badge variant="secondary">Pending</Badge>;
			case "cancelled":
				return <Badge variant="destructive">Cancelled</Badge>;
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
						<Users className="h-6 w-6" />
						Employee Transfers
					</h1>
					<p className="text-muted-foreground">Move employees between companies without termination</p>
				</div>
				<Button onClick={() => setTransferDialogOpen(true)}>
					<ArrowRight className="h-4 w-4 mr-2" />
					New Transfer
				</Button>
			</div>

			{/* Transfer History */}
			<Card>
				<CardHeader>
					<CardTitle>Transfer History</CardTitle>
					<CardDescription>All employee transfers between group companies</CardDescription>
				</CardHeader>
				<CardContent>
					{transfers && transfers.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Employee</TableHead>
									<TableHead>From</TableHead>
									<TableHead />
									<TableHead>To</TableHead>
									<TableHead>Effective Date</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Transferred By</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{transfers.map((transfer) => (
									<TableRow key={transfer.id}>
										<TableCell>
											<div>
												<p className="font-medium">{transfer.employeeName}</p>
												<p className="text-xs text-muted-foreground">{transfer.employeeNumber}</p>
											</div>
										</TableCell>
										<TableCell>{transfer.sourceCompanyName}</TableCell>
										<TableCell>
											<ArrowRight className="h-4 w-4 text-muted-foreground" />
										</TableCell>
										<TableCell>{transfer.destinationCompanyName}</TableCell>
										<TableCell>{new Date(transfer.effectiveDate).toLocaleDateString()}</TableCell>
										<TableCell>{getStatusBadge(transfer.status)}</TableCell>
										<TableCell className="text-muted-foreground">{transfer.createdBy}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-muted-foreground text-center py-8">No transfers recorded</p>
					)}
				</CardContent>
			</Card>

			{/* Transfer Dialog */}
			<Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Transfer Employee</DialogTitle>
						<DialogDescription>Move an employee to another company in the group</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>Source Company</Label>
							<Select value={sourceCompany} onValueChange={setSourceCompany}>
								<SelectTrigger>
									<SelectValue placeholder="Select source company" />
								</SelectTrigger>
								<SelectContent>
									{companies?.map((c) => (
										<SelectItem key={c.id} value={c.id}>
											{c.tradingName}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>Employee</Label>
							<Select value={selectedEmployee} onValueChange={setSelectedEmployee} disabled={!sourceCompany}>
								<SelectTrigger>
									<SelectValue placeholder="Select employee" />
								</SelectTrigger>
								<SelectContent>
									{employees?.map((e) => (
										<SelectItem key={e.id} value={e.id}>
											{e.name} ({e.employeeNumber})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>Destination Company</Label>
							<Select value={destinationCompany} onValueChange={setDestinationCompany}>
								<SelectTrigger>
									<SelectValue placeholder="Select destination company" />
								</SelectTrigger>
								<SelectContent>
									{companies
										?.filter((c) => c.id !== sourceCompany)
										.map((c) => (
											<SelectItem key={c.id} value={c.id}>
												{c.tradingName}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>Effective Date</Label>
							<Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
						</div>

						<Separator />

						<div className="space-y-3">
							<Label>Transfer Options</Label>
							<div className="flex items-center gap-2">
								<Checkbox
									id="preserveLeave"
									checked={options.preserveLeaveBalances}
									onCheckedChange={(checked) => setOptions({ ...options, preserveLeaveBalances: !!checked })}
								/>
								<Label htmlFor="preserveLeave">Preserve leave balances</Label>
							</div>
							<div className="flex items-center gap-2">
								<Checkbox
									id="preserveService"
									checked={options.preserveServiceDate}
									onCheckedChange={(checked) => setOptions({ ...options, preserveServiceDate: !!checked })}
								/>
								<Label htmlFor="preserveService">Preserve service date</Label>
							</div>
							<div className="flex items-center gap-2">
								<Checkbox
									id="resetTax"
									checked={options.resetTaxYear}
									onCheckedChange={(checked) => setOptions({ ...options, resetTaxYear: !!checked })}
								/>
								<Label htmlFor="resetTax">Reset tax year context</Label>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handlePreview} disabled={previewTransfer.isPending}>
							{previewTransfer.isPending ? "Loading..." : "Preview Transfer"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Confirm Dialog */}
			<Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Transfer</DialogTitle>
						<DialogDescription>Review the impact of this transfer before proceeding</DialogDescription>
					</DialogHeader>

					{impact && (
						<div className="space-y-4">
							{impact.warnings.length > 0 && (
								<Alert variant="destructive">
									<AlertTriangle className="h-4 w-4" />
									<AlertDescription>
										<ul className="list-disc list-inside">
											{impact.warnings.map((w) => (
												<li key={w}>{w}</li>
											))}
										</ul>
									</AlertDescription>
								</Alert>
							)}

							<div className="grid grid-cols-2 gap-4">
								<div className="p-3 border rounded-lg">
									<p className="text-sm text-muted-foreground">Service Years</p>
									<p className="font-medium">{impact.serviceYears} years</p>
								</div>
								<div className="p-3 border rounded-lg">
									<p className="text-sm text-muted-foreground">Current Salary</p>
									<p className="font-medium">R {impact.currentSalary.toLocaleString()}</p>
								</div>
							</div>

							<div className="p-3 border rounded-lg">
								<p className="text-sm text-muted-foreground mb-2">Leave Balances</p>
								<div className="space-y-1">
									{impact.leaveBalances.map((lb) => (
										<div key={lb.type} className="flex justify-between text-sm">
											<span>{lb.type}</span>
											<span className="font-medium">{lb.balance} days</span>
										</div>
									))}
								</div>
							</div>

							<Alert>
								<CheckCircle className="h-4 w-4" />
								<AlertDescription>
									This transfer will not create a termination or rehire event. Payroll continuity will be maintained.
								</AlertDescription>
							</Alert>
						</div>
					)}

					<DialogFooter>
						<Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleConfirmTransfer} disabled={executeTransfer.isPending}>
							{executeTransfer.isPending ? "Transferring..." : "Confirm Transfer"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

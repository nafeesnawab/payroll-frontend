import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Textarea } from "@/ui/textarea";
import type { LeaveBalance, LeaveType } from "@/types/leave";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Loader2, PenLine, Search, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

export default function LeaveBalancesPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState("all");
	const [negativeOnly, setNegativeOnly] = useState(searchParams.get("negativeOnly") === "true");
	const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
	const [selectedBalance, setSelectedBalance] = useState<LeaveBalance | null>(null);
	const [adjustAmount, setAdjustAmount] = useState("");
	const [adjustReason, setAdjustReason] = useState("");

	const { data: balances, isLoading } = useQuery({
		queryKey: ["leave-balances", { type: typeFilter, negativeOnly }],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (typeFilter !== "all") params.set("leaveTypeId", typeFilter);
			if (negativeOnly) params.set("negativeOnly", "true");
			const response = await axios.get(`/api/leave/balances?${params.toString()}`);
			return response.data.data as LeaveBalance[];
		},
	});

	const { data: leaveTypes } = useQuery({
		queryKey: ["leave-types"],
		queryFn: async () => {
			const response = await axios.get("/api/leave/types");
			return response.data.data as LeaveType[];
		},
	});

	const adjustMutation = useMutation({
		mutationFn: async ({
			employeeId,
			leaveTypeId,
			amount,
			reason,
		}: {
			employeeId: string;
			leaveTypeId: string;
			amount: number;
			reason: string;
		}) => axios.put(`/api/leave/balances/${employeeId}`, { leaveTypeId, amount, reason }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
			setAdjustDialogOpen(false);
			setAdjustAmount("");
			setAdjustReason("");
			toast.success("Balance adjusted");
		},
	});

	const filteredBalances = balances?.filter(
		(b) => b.employeeName.toLowerCase().includes(search.toLowerCase()) || b.employeeNumber.includes(search),
	);

	const groupedBalances = filteredBalances?.reduce(
		(acc, b) => {
			if (!acc[b.employeeId]) {
				acc[b.employeeId] = { employeeName: b.employeeName, employeeNumber: b.employeeNumber, balances: [] };
			}
			acc[b.employeeId].balances.push(b);
			return acc;
		},
		{} as Record<string, { employeeName: string; employeeNumber: string; balances: LeaveBalance[] }>,
	);

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => navigate("/leave")}>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Users className="h-6 w-6" />
						Employee Leave Balances
					</h1>
					<p className="text-muted-foreground">View and adjust employee leave balances</p>
				</div>
			</div>

			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-wrap gap-4 mb-6">
						<div className="relative flex-1 min-w-[200px] max-w-sm">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search employee..."
								className="pl-9"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
						<Select value={typeFilter} onValueChange={setTypeFilter}>
							<SelectTrigger className="w-48">
								<SelectValue placeholder="Leave Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								{leaveTypes?.map((lt) => (
									<SelectItem key={lt.id} value={lt.id}>
										{lt.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button variant={negativeOnly ? "default" : "outline"} onClick={() => setNegativeOnly(!negativeOnly)}>
							Negative Only
						</Button>
					</div>

					{isLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-24 w-full" />
							))}
						</div>
					) : (
						<div className="space-y-4">
							{groupedBalances &&
								Object.entries(groupedBalances).map(([employeeId, data]) => (
									<Card key={employeeId}>
										<CardContent className="pt-4">
											<div className="flex items-center justify-between mb-4">
												<div>
													<p className="font-medium">{data.employeeName}</p>
													<p className="text-sm text-muted-foreground">{data.employeeNumber}</p>
												</div>
											</div>
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>Leave Type</TableHead>
														<TableHead className="text-right">Accrued</TableHead>
														<TableHead className="text-right">Taken</TableHead>
														<TableHead className="text-right">Pending</TableHead>
														<TableHead className="text-right">Available</TableHead>
														<TableHead className="w-12"></TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{data.balances.map((bal) => (
														<TableRow key={bal.id}>
															<TableCell>{bal.leaveTypeName}</TableCell>
															<TableCell className="text-right font-mono">{bal.accrued}</TableCell>
															<TableCell className="text-right font-mono">{bal.taken}</TableCell>
															<TableCell className="text-right font-mono">{bal.pending}</TableCell>
															<TableCell className="text-right">
																<Badge variant={bal.isNegative ? "destructive" : "outline"} className="font-mono">
																	{bal.available}
																</Badge>
															</TableCell>
															<TableCell>
																<Dialog
																	open={adjustDialogOpen && selectedBalance?.id === bal.id}
																	onOpenChange={(open) => {
																		setAdjustDialogOpen(open);
																		if (open) setSelectedBalance(bal);
																	}}
																>
																	<DialogTrigger asChild>
																		<Button size="sm" variant="ghost">
																			<PenLine className="h-4 w-4" />
																		</Button>
																	</DialogTrigger>
																	<DialogContent>
																		<DialogHeader>
																			<DialogTitle>Adjust Balance</DialogTitle>
																		</DialogHeader>
																		<div className="space-y-4">
																			<p className="text-sm text-muted-foreground">
																				{bal.employeeName} - {bal.leaveTypeName}
																			</p>
																			<p className="text-sm">
																				Current balance: <span className="font-bold">{bal.available} days</span>
																			</p>
																			<Input
																				type="number"
																				placeholder="Adjustment amount (e.g., 2 or -1)"
																				value={adjustAmount}
																				onChange={(e) => setAdjustAmount(e.target.value)}
																			/>
																			<Textarea
																				placeholder="Reason for adjustment (required)"
																				value={adjustReason}
																				onChange={(e) => setAdjustReason(e.target.value)}
																			/>
																			<div className="flex justify-end gap-2">
																				<Button variant="outline" onClick={() => setAdjustDialogOpen(false)}>
																					Cancel
																				</Button>
																				<Button
																					onClick={() =>
																						adjustMutation.mutate({
																							employeeId: bal.employeeId,
																							leaveTypeId: bal.leaveTypeId,
																							amount: Number(adjustAmount),
																							reason: adjustReason,
																						})
																					}
																					disabled={!adjustAmount || !adjustReason || adjustMutation.isPending}
																				>
																					{adjustMutation.isPending ? (
																						<Loader2 className="h-4 w-4 animate-spin mr-2" />
																					) : null}
																					Apply
																				</Button>
																			</div>
																		</div>
																	</DialogContent>
																</Dialog>
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</CardContent>
									</Card>
								))}
							{(!groupedBalances || Object.keys(groupedBalances).length === 0) && (
								<p className="text-center py-12 text-muted-foreground">No balances found</p>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

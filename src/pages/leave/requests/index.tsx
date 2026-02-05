import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Textarea } from "@/ui/textarea";
import type { LeaveRequest, LeaveType } from "@/types/leave";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Check, FileText, Loader2, Search, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
	pending: { label: "Pending", variant: "secondary" },
	approved: { label: "Approved", variant: "default" },
	rejected: { label: "Rejected", variant: "destructive" },
	cancelled: { label: "Cancelled", variant: "outline" },
};

export default function LeaveRequestsPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
	const [typeFilter, setTypeFilter] = useState("all");
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
	const [rejectReason, setRejectReason] = useState("");

	const { data: requests, isLoading } = useQuery({
		queryKey: ["leave-requests", { status: statusFilter, type: typeFilter }],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (statusFilter !== "all") params.set("status", statusFilter);
			if (typeFilter !== "all") params.set("leaveTypeId", typeFilter);
			const response = await axios.get(`/api/leave/requests?${params.toString()}`);
			return response.data.data as LeaveRequest[];
		},
	});

	const { data: leaveTypes } = useQuery({
		queryKey: ["leave-types"],
		queryFn: async () => {
			const response = await axios.get("/api/leave/types");
			return response.data.data as LeaveType[];
		},
	});

	const approveMutation = useMutation({
		mutationFn: async (id: string) => axios.put(`/api/leave/requests/${id}/approve`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
			toast.success("Leave request approved");
		},
	});

	const rejectMutation = useMutation({
		mutationFn: async ({ id, reason }: { id: string; reason: string }) =>
			axios.put(`/api/leave/requests/${id}/reject`, { reason }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
			setRejectDialogOpen(false);
			setRejectReason("");
			toast.success("Leave request rejected");
		},
	});

	const filteredRequests = requests?.filter(
		(r) => r.employeeName.toLowerCase().includes(search.toLowerCase()) || r.employeeNumber.includes(search)
	);

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => navigate("/leave")}>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<FileText className="h-6 w-6" />
						Leave Requests
					</h1>
					<p className="text-muted-foreground">Review and manage leave requests</p>
				</div>
			</div>

			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-wrap gap-4 mb-6">
						<div className="relative flex-1 min-w-[200px] max-w-sm">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input placeholder="Search employee..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
						</div>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="approved">Approved</SelectItem>
								<SelectItem value="rejected">Rejected</SelectItem>
								<SelectItem value="cancelled">Cancelled</SelectItem>
							</SelectContent>
						</Select>
						<Select value={typeFilter} onValueChange={setTypeFilter}>
							<SelectTrigger className="w-48">
								<SelectValue placeholder="Leave Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								{leaveTypes?.map((lt) => (
									<SelectItem key={lt.id} value={lt.id}>{lt.name}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{isLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Employee</TableHead>
									<TableHead>Leave Type</TableHead>
									<TableHead>Dates</TableHead>
									<TableHead className="text-center">Days</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredRequests?.map((req) => {
									const status = statusConfig[req.status];
									return (
										<TableRow key={req.id}>
											<TableCell>
												<div>
													<p className="font-medium">{req.employeeName}</p>
													<p className="text-sm text-muted-foreground">{req.employeeNumber}</p>
												</div>
											</TableCell>
											<TableCell>{req.leaveTypeName}</TableCell>
											<TableCell>
												<p className="text-sm">{req.startDate}</p>
												<p className="text-sm text-muted-foreground">to {req.endDate}</p>
											</TableCell>
											<TableCell className="text-center font-medium">{req.days}</TableCell>
											<TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
											<TableCell className="text-right">
												{req.status === "pending" && (
													<div className="flex justify-end gap-2">
														<Button size="sm" variant="outline" onClick={() => approveMutation.mutate(req.id)} disabled={approveMutation.isPending}>
															{approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
														</Button>
														<Dialog open={rejectDialogOpen && selectedRequest?.id === req.id} onOpenChange={(open) => { setRejectDialogOpen(open); if (open) setSelectedRequest(req); }}>
															<DialogTrigger asChild>
																<Button size="sm" variant="destructive"><X className="h-4 w-4" /></Button>
															</DialogTrigger>
															<DialogContent>
																<DialogHeader>
																	<DialogTitle>Reject Leave Request</DialogTitle>
																</DialogHeader>
																<div className="space-y-4">
																	<p className="text-sm text-muted-foreground">
																		Rejecting {req.employeeName}'s {req.leaveTypeName} request for {req.days} day(s)
																	</p>
																	<Textarea placeholder="Reason for rejection (required)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
																	<div className="flex justify-end gap-2">
																		<Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
																		<Button variant="destructive" onClick={() => rejectMutation.mutate({ id: req.id, reason: rejectReason })} disabled={!rejectReason || rejectMutation.isPending}>
																			{rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
																			Reject
																		</Button>
																	</div>
																</div>
															</DialogContent>
														</Dialog>
													</div>
												)}
											</TableCell>
										</TableRow>
									);
								})}
								{filteredRequests?.length === 0 && (
									<TableRow>
										<TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
											No leave requests found
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

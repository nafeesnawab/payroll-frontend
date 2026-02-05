import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import type { LeaveBalance, LeaveRequest } from "@/types/leave";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, CalendarDays, CalendarPlus, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
	pending: { label: "Pending", variant: "secondary" },
	approved: { label: "Approved", variant: "default" },
	rejected: { label: "Rejected", variant: "destructive" },
	cancelled: { label: "Cancelled", variant: "outline" },
};

export default function MyLeavePage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

	const { data: balances, isLoading: balancesLoading } = useQuery({
		queryKey: ["my-leave-balances"],
		queryFn: async () => {
			const response = await axios.get("/api/leave/my/balances");
			return response.data.data as LeaveBalance[];
		},
	});

	const { data: requests, isLoading: requestsLoading } = useQuery({
		queryKey: ["my-leave-requests"],
		queryFn: async () => {
			const response = await axios.get("/api/leave/my/requests");
			return response.data.data as LeaveRequest[];
		},
	});

	const cancelMutation = useMutation({
		mutationFn: async (id: string) => axios.put(`/api/leave/requests/${id}/cancel`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["my-leave-requests"] });
			queryClient.invalidateQueries({ queryKey: ["my-leave-balances"] });
			setCancelDialogOpen(false);
			toast.success("Request cancelled");
		},
	});

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => navigate("/leave")}>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold flex items-center gap-2">
							<CalendarDays className="h-6 w-6" />
							My Leave
						</h1>
						<p className="text-muted-foreground">View your leave balances and requests</p>
					</div>
				</div>
				<Button onClick={() => navigate("/leave/request/new")}>
					<CalendarPlus className="h-4 w-4 mr-2" />
					Request Leave
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-4">
				{balancesLoading ? (
					[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)
				) : (
					balances?.map((bal) => (
						<Card key={bal.id}>
							<CardHeader className="pb-2">
								<CardDescription>{bal.leaveTypeName}</CardDescription>
								<CardTitle className={`text-3xl ${bal.isNegative ? "text-destructive" : ""}`}>
									{bal.available}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">days available</p>
								<div className="flex gap-4 mt-2 text-xs text-muted-foreground">
									<span>Accrued: {bal.accrued}</span>
									<span>Taken: {bal.taken}</span>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>My Requests</CardTitle>
					<CardDescription>Your leave request history</CardDescription>
				</CardHeader>
				<CardContent>
					{requestsLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Leave Type</TableHead>
									<TableHead>Dates</TableHead>
									<TableHead className="text-center">Days</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{requests?.map((req) => {
									const status = statusConfig[req.status];
									return (
										<TableRow key={req.id}>
											<TableCell className="font-medium">{req.leaveTypeName}</TableCell>
											<TableCell>
												<p className="text-sm">{req.startDate}</p>
												<p className="text-sm text-muted-foreground">to {req.endDate}</p>
											</TableCell>
											<TableCell className="text-center">{req.days}</TableCell>
											<TableCell>
												<Badge variant={status.variant}>{status.label}</Badge>
												{req.status === "rejected" && req.rejectionReason && (
													<p className="text-xs text-muted-foreground mt-1">{req.rejectionReason}</p>
												)}
											</TableCell>
											<TableCell className="text-right">
												{req.status === "pending" && (
													<Dialog open={cancelDialogOpen && selectedRequest?.id === req.id} onOpenChange={(open) => { setCancelDialogOpen(open); if (open) setSelectedRequest(req); }}>
														<DialogTrigger asChild>
															<Button size="sm" variant="ghost"><X className="h-4 w-4" /></Button>
														</DialogTrigger>
														<DialogContent>
															<DialogHeader>
																<DialogTitle>Cancel Request</DialogTitle>
																<DialogDescription>Are you sure you want to cancel this leave request?</DialogDescription>
															</DialogHeader>
															<div className="flex justify-end gap-2 mt-4">
																<Button variant="outline" onClick={() => setCancelDialogOpen(false)}>No, Keep It</Button>
																<Button variant="destructive" onClick={() => cancelMutation.mutate(req.id)} disabled={cancelMutation.isPending}>
																	{cancelMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
																	Yes, Cancel
																</Button>
															</div>
														</DialogContent>
													</Dialog>
												)}
											</TableCell>
										</TableRow>
									);
								})}
								{requests?.length === 0 && (
									<TableRow>
										<TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
											No leave requests yet
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

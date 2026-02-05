import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CalendarDays, CalendarPlus, CheckCircle, Clock, XCircle } from "lucide-react";
import { useNavigate } from "react-router";
import type { ESSLeaveBalance, ESSLeaveRequest } from "@/types/ess";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

export default function ESSLeavePage() {
	const navigate = useNavigate();

	const { data: balances, isLoading: loadingBalances } = useQuery({
		queryKey: ["ess-leave-balances"],
		queryFn: async () => {
			const response = await axios.get("/api/ess/leave/balances");
			return response.data.data as ESSLeaveBalance[];
		},
	});

	const { data: requests, isLoading: loadingRequests } = useQuery({
		queryKey: ["ess-leave-requests"],
		queryFn: async () => {
			const response = await axios.get("/api/ess/leave/requests");
			return response.data.data as ESSLeaveRequest[];
		},
	});

	const isLoading = loadingBalances || loadingRequests;

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "approved":
				return <CheckCircle className="h-4 w-4 text-green-600" />;
			case "rejected":
				return <XCircle className="h-4 w-4 text-red-600" />;
			case "pending":
				return <Clock className="h-4 w-4 text-amber-600" />;
			default:
				return null;
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "approved":
				return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
			case "rejected":
				return <Badge variant="destructive">Rejected</Badge>;
			case "pending":
				return <Badge variant="secondary">Pending</Badge>;
			case "cancelled":
				return <Badge variant="outline">Cancelled</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<div className="grid gap-4 md:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-32" />
					))}
				</div>
				<Skeleton className="h-96" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<CalendarDays className="h-6 w-6" />
						My Leave
					</h1>
					<p className="text-muted-foreground">View balances and manage leave requests</p>
				</div>
				<Button onClick={() => navigate("/ess/leave/new")}>
					<CalendarPlus className="h-4 w-4 mr-2" />
					Apply for Leave
				</Button>
			</div>

			{/* Leave Balance Cards */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{balances?.map((balance) => (
					<Card key={balance.leaveTypeId}>
						<CardHeader className="pb-2">
							<CardDescription>{balance.leaveTypeName}</CardDescription>
							<CardTitle className={`text-3xl ${balance.available < 0 ? "text-destructive" : ""}`}>
								{balance.available}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-xs text-muted-foreground space-y-1">
								<div className="flex justify-between">
									<span>Accrued</span>
									<span>{balance.accrued}</span>
								</div>
								<div className="flex justify-between">
									<span>Taken</span>
									<span>{balance.taken}</span>
								</div>
								{balance.pending > 0 && (
									<div className="flex justify-between text-amber-600">
										<span>Pending</span>
										<span>{balance.pending}</span>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Leave Requests */}
			<Card>
				<CardHeader>
					<CardTitle>Leave Requests</CardTitle>
					<CardDescription>Your leave request history</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="all">
						<TabsList>
							<TabsTrigger value="all">All</TabsTrigger>
							<TabsTrigger value="pending">Pending</TabsTrigger>
							<TabsTrigger value="approved">Approved</TabsTrigger>
							<TabsTrigger value="rejected">Rejected</TabsTrigger>
						</TabsList>

						<TabsContent value="all" className="mt-4">
							<LeaveRequestList requests={requests || []} getStatusBadge={getStatusBadge} />
						</TabsContent>
						<TabsContent value="pending" className="mt-4">
							<LeaveRequestList
								requests={requests?.filter((r) => r.status === "pending") || []}
								getStatusBadge={getStatusBadge}
							/>
						</TabsContent>
						<TabsContent value="approved" className="mt-4">
							<LeaveRequestList
								requests={requests?.filter((r) => r.status === "approved") || []}
								getStatusBadge={getStatusBadge}
							/>
						</TabsContent>
						<TabsContent value="rejected" className="mt-4">
							<LeaveRequestList
								requests={requests?.filter((r) => r.status === "rejected") || []}
								getStatusBadge={getStatusBadge}
							/>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}

function LeaveRequestList({
	requests,
	getStatusBadge,
}: {
	requests: ESSLeaveRequest[];
	getStatusBadge: (status: string) => React.ReactNode;
}) {
	if (requests.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				<CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
				<p>No leave requests found</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{requests.map((request) => (
				<div
					key={request.id}
					className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
				>
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<span className="font-medium">{request.leaveTypeName}</span>
							{getStatusBadge(request.status)}
						</div>
						<p className="text-sm text-muted-foreground">
							{request.startDate} - {request.endDate} ({request.days} day
							{request.days !== 1 ? "s" : ""})
						</p>
						{request.reason && <p className="text-sm text-muted-foreground">{request.reason}</p>}
						{request.rejectionReason && <p className="text-sm text-destructive">Reason: {request.rejectionReason}</p>}
					</div>
					<div className="text-right text-sm text-muted-foreground">
						<p>Submitted</p>
						<p>{new Date(request.createdAt).toLocaleDateString()}</p>
					</div>
				</div>
			))}
		</div>
	);
}

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Building2, Clock, CreditCard, Edit, Mail, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { CreateProfileChangeRequest, ESSProfile, ESSProfileChangeRequest } from "@/types/ess";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Separator } from "@/ui/separator";
import { Skeleton } from "@/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Textarea } from "@/ui/textarea";

const changeRequestSchema = z.object({
	requestedValue: z.string().min(1, "New value is required"),
	reason: z.string().optional(),
});

type ChangeRequestForm = z.infer<typeof changeRequestSchema>;

export default function ESSProfilePage() {
	const queryClient = useQueryClient();
	const [editField, setEditField] = useState<{ field: string; label: string; currentValue: string } | null>(null);

	const { data: profile, isLoading: loadingProfile } = useQuery({
		queryKey: ["ess-profile"],
		queryFn: async () => {
			const response = await axios.get("/api/ess/profile");
			return response.data.data as ESSProfile;
		},
	});

	const { data: changeRequests, isLoading: loadingRequests } = useQuery({
		queryKey: ["ess-profile-requests"],
		queryFn: async () => {
			const response = await axios.get("/api/ess/profile/requests");
			return response.data.data as ESSProfileChangeRequest[];
		},
	});

	const form = useForm<ChangeRequestForm>({
		resolver: zodResolver(changeRequestSchema),
		defaultValues: {
			requestedValue: "",
			reason: "",
		},
	});

	const createChangeRequest = useMutation({
		mutationFn: async (data: CreateProfileChangeRequest) => {
			const response = await axios.post("/api/ess/profile/requests", data);
			return response.data;
		},
		onSuccess: () => {
			toast.success("Change request submitted for approval");
			queryClient.invalidateQueries({ queryKey: ["ess-profile-requests"] });
			setEditField(null);
			form.reset();
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to submit change request");
		},
	});

	const onSubmitChange = (data: ChangeRequestForm) => {
		if (!editField) return;
		createChangeRequest.mutate({
			field: editField.field,
			currentValue: editField.currentValue,
			requestedValue: data.requestedValue,
			reason: data.reason,
		});
	};

	const openEditDialog = (field: string, label: string, currentValue: string) => {
		setEditField({ field, label, currentValue });
		form.reset({ requestedValue: currentValue, reason: "" });
	};

	const isLoading = loadingProfile || loadingRequests;

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-96" />
			</div>
		);
	}

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "approved":
				return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
			case "rejected":
				return <Badge variant="destructive">Rejected</Badge>;
			case "pending":
				return <Badge variant="secondary">Pending</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<User className="h-6 w-6" />
					My Profile
				</h1>
				<p className="text-muted-foreground">View and request changes to your personal information</p>
			</div>

			<Tabs defaultValue="details">
				<TabsList>
					<TabsTrigger value="details">Personal Details</TabsTrigger>
					<TabsTrigger value="requests">
						Change Requests
						{changeRequests && changeRequests.filter((r) => r.status === "pending").length > 0 && (
							<Badge variant="secondary" className="ml-2">
								{changeRequests.filter((r) => r.status === "pending").length}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="details" className="mt-6">
					<div className="grid gap-6 md:grid-cols-2">
						{/* Personal Information - Read Only */}
						<Card>
							<CardHeader>
								<CardTitle className="text-base flex items-center gap-2">
									<User className="h-4 w-4" />
									Personal Information
								</CardTitle>
								<CardDescription>These details cannot be changed directly</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-muted-foreground">First Name</p>
										<p className="font-medium">{profile?.firstName}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Last Name</p>
										<p className="font-medium">{profile?.lastName}</p>
									</div>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Employee Number</p>
									<p className="font-medium">{profile?.employeeNumber}</p>
								</div>
								{profile?.idNumber && (
									<div>
										<p className="text-sm text-muted-foreground">ID Number</p>
										<p className="font-medium">{profile.idNumber}</p>
									</div>
								)}
								{profile?.passportNumber && (
									<div>
										<p className="text-sm text-muted-foreground">Passport Number</p>
										<p className="font-medium">{profile.passportNumber}</p>
									</div>
								)}
								{profile?.taxNumber && (
									<div>
										<p className="text-sm text-muted-foreground">Tax Number</p>
										<p className="font-medium">{profile.taxNumber}</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Employment Details - Read Only */}
						<Card>
							<CardHeader>
								<CardTitle className="text-base flex items-center gap-2">
									<Building2 className="h-4 w-4" />
									Employment Details
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<p className="text-sm text-muted-foreground">Position</p>
									<p className="font-medium">{profile?.position}</p>
								</div>
								{profile?.department && (
									<div>
										<p className="text-sm text-muted-foreground">Department</p>
										<p className="font-medium">{profile.department}</p>
									</div>
								)}
								<div>
									<p className="text-sm text-muted-foreground">Start Date</p>
									<p className="font-medium">{profile?.startDate}</p>
								</div>
							</CardContent>
						</Card>

						{/* Contact Details - Editable via Request */}
						<Card>
							<CardHeader>
								<CardTitle className="text-base flex items-center gap-2">
									<Mail className="h-4 w-4" />
									Contact Details
								</CardTitle>
								<CardDescription>Request changes to these details</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">Email Address</p>
										<p className="font-medium">{profile?.email || "-"}</p>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => openEditDialog("email", "Email Address", profile?.email || "")}
									>
										<Edit className="h-4 w-4" />
									</Button>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">Phone Number</p>
										<p className="font-medium">{profile?.phone || "-"}</p>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => openEditDialog("phone", "Phone Number", profile?.phone || "")}
									>
										<Edit className="h-4 w-4" />
									</Button>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">Address</p>
										<p className="font-medium">{profile?.address || "-"}</p>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => openEditDialog("address", "Address", profile?.address || "")}
									>
										<Edit className="h-4 w-4" />
									</Button>
								</div>
							</CardContent>
						</Card>

						{/* Bank Details - Editable via Request */}
						<Card>
							<CardHeader>
								<CardTitle className="text-base flex items-center gap-2">
									<CreditCard className="h-4 w-4" />
									Bank Details
								</CardTitle>
								<CardDescription>Changes require admin approval</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">Bank Name</p>
										<p className="font-medium">{profile?.bankName || "-"}</p>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => openEditDialog("bankName", "Bank Name", profile?.bankName || "")}
									>
										<Edit className="h-4 w-4" />
									</Button>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">Account Number</p>
										<p className="font-medium">
											{profile?.accountNumber ? `****${profile.accountNumber.slice(-4)}` : "-"}
										</p>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => openEditDialog("accountNumber", "Account Number", profile?.accountNumber || "")}
									>
										<Edit className="h-4 w-4" />
									</Button>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">Branch Code</p>
										<p className="font-medium">{profile?.branchCode || "-"}</p>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => openEditDialog("branchCode", "Branch Code", profile?.branchCode || "")}
									>
										<Edit className="h-4 w-4" />
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="requests" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Change Request History</CardTitle>
							<CardDescription>Track the status of your profile change requests</CardDescription>
						</CardHeader>
						<CardContent>
							{changeRequests && changeRequests.length > 0 ? (
								<div className="space-y-4">
									{changeRequests.map((request) => (
										<div key={request.id} className="flex items-start justify-between p-4 border rounded-lg">
											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<span className="font-medium capitalize">{request.field.replace(/([A-Z])/g, " $1")}</span>
													{getStatusBadge(request.status)}
												</div>
												<p className="text-sm text-muted-foreground">
													{request.currentValue} → {request.requestedValue}
												</p>
												{request.reason && <p className="text-sm text-muted-foreground">Reason: {request.reason}</p>}
												{request.rejectionReason && (
													<p className="text-sm text-destructive">Rejection: {request.rejectionReason}</p>
												)}
											</div>
											<div className="text-right text-sm text-muted-foreground">
												<p>{new Date(request.createdAt).toLocaleDateString()}</p>
												{request.processedAt && (
													<p className="text-xs">Processed: {new Date(request.processedAt).toLocaleDateString()}</p>
												)}
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8 text-muted-foreground">
									<Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<p>No change requests yet</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Change Request Dialog */}
			<Dialog open={!!editField} onOpenChange={(open) => !open && setEditField(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Request Change: {editField?.label}</DialogTitle>
						<DialogDescription>
							Submit a change request for admin approval. Your current value will remain until approved.
						</DialogDescription>
					</DialogHeader>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmitChange)} className="space-y-4">
							<div>
								<p className="text-sm text-muted-foreground mb-1">Current Value</p>
								<p className="font-medium">{editField?.currentValue || "(empty)"}</p>
							</div>

							<FormField
								control={form.control}
								name="requestedValue"
								render={({ field }) => (
									<FormItem>
										<FormLabel>New Value</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="reason"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Reason (Optional)</FormLabel>
										<FormControl>
											<Textarea placeholder="Why are you requesting this change?" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<DialogFooter>
								<Button type="button" variant="outline" onClick={() => setEditField(null)}>
									Cancel
								</Button>
								<Button type="submit" disabled={createChangeRequest.isPending}>
									{createChangeRequest.isPending ? "Submitting..." : "Submit Request"}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}

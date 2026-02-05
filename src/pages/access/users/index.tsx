import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Mail, MoreHorizontal, Shield, UserMinus, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { InviteUserInput, Role, SystemUser } from "@/types/access";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export default function UsersPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
	const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
	const [inviteForm, setInviteForm] = useState({
		email: "",
		firstName: "",
		lastName: "",
		roleId: "",
	});

	const { data: users, isLoading: loadingUsers } = useQuery({
		queryKey: ["access-users"],
		queryFn: async () => {
			const response = await axios.get("/api/access/users");
			return response.data.data as SystemUser[];
		},
	});

	const { data: roles } = useQuery({
		queryKey: ["access-roles"],
		queryFn: async () => {
			const response = await axios.get("/api/access/roles");
			return response.data.data as Role[];
		},
	});

	const inviteUser = useMutation({
		mutationFn: async (data: InviteUserInput) => {
			const response = await axios.post("/api/access/users/invite", data);
			return response.data;
		},
		onSuccess: () => {
			toast.success("Invitation sent successfully");
			queryClient.invalidateQueries({ queryKey: ["access-users"] });
			setInviteDialogOpen(false);
			setInviteForm({ email: "", firstName: "", lastName: "", roleId: "" });
		},
		onError: () => {
			toast.error("Failed to send invitation");
		},
	});

	const suspendUser = useMutation({
		mutationFn: async (id: string) => {
			const response = await axios.put(`/api/access/users/${id}`, { status: "suspended" });
			return response.data;
		},
		onSuccess: () => {
			toast.success("User suspended successfully");
			queryClient.invalidateQueries({ queryKey: ["access-users"] });
			setSuspendDialogOpen(false);
			setSelectedUser(null);
		},
		onError: () => {
			toast.error("Failed to suspend user");
		},
	});

	const reactivateUser = useMutation({
		mutationFn: async (id: string) => {
			const response = await axios.put(`/api/access/users/${id}`, { status: "active" });
			return response.data;
		},
		onSuccess: () => {
			toast.success("User reactivated successfully");
			queryClient.invalidateQueries({ queryKey: ["access-users"] });
		},
		onError: () => {
			toast.error("Failed to reactivate user");
		},
	});

	const handleInvite = () => {
		if (!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName || !inviteForm.roleId) {
			toast.error("Please fill in all required fields");
			return;
		}
		inviteUser.mutate({
			email: inviteForm.email,
			firstName: inviteForm.firstName,
			lastName: inviteForm.lastName,
			roleIds: [inviteForm.roleId],
			companyAccess: "all",
		});
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
			case "invited":
				return <Badge variant="secondary">Invited</Badge>;
			case "suspended":
				return <Badge variant="destructive">Suspended</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	if (loadingUsers) {
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
						User Management
					</h1>
					<p className="text-muted-foreground">Manage system users and their access</p>
				</div>
				<Button onClick={() => setInviteDialogOpen(true)}>
					<UserPlus className="h-4 w-4 mr-2" />
					Invite User
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>System Users</CardTitle>
					<CardDescription>Users with access to the payroll system</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role(s)</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Last Login</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users?.map((user) => (
								<TableRow key={user.id}>
									<TableCell className="font-medium">
										{user.firstName} {user.lastName}
									</TableCell>
									<TableCell className="text-muted-foreground">{user.email}</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{user.roleNames.map((role) => (
												<Badge key={role} variant="outline" className="text-xs">
													<Shield className="h-3 w-3 mr-1" />
													{role}
												</Badge>
											))}
										</div>
									</TableCell>
									<TableCell>{getStatusBadge(user.status)}</TableCell>
									<TableCell className="text-muted-foreground">
										{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => navigate(`/access/users/${user.id}`)}>
													View Details
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => navigate(`/access/users/${user.id}`)}>
													Edit Roles
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												{user.status === "suspended" ? (
													<DropdownMenuItem onClick={() => reactivateUser.mutate(user.id)}>
														<UserPlus className="h-4 w-4 mr-2" />
														Reactivate
													</DropdownMenuItem>
												) : (
													<DropdownMenuItem
														className="text-destructive"
														onClick={() => {
															setSelectedUser(user);
															setSuspendDialogOpen(true);
														}}
													>
														<UserMinus className="h-4 w-4 mr-2" />
														Suspend
													</DropdownMenuItem>
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Invite User Dialog */}
			<Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Invite User</DialogTitle>
						<DialogDescription>
							Send an invitation to a new user. They will receive an email to set up their account.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="firstName">First Name</Label>
								<Input
									id="firstName"
									value={inviteForm.firstName}
									onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="lastName">Last Name</Label>
								<Input
									id="lastName"
									value={inviteForm.lastName}
									onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email Address</Label>
							<Input
								id="email"
								type="email"
								value={inviteForm.email}
								onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="role">Initial Role</Label>
							<Select
								value={inviteForm.roleId}
								onValueChange={(value) => setInviteForm({ ...inviteForm, roleId: value })}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a role" />
								</SelectTrigger>
								<SelectContent>
									{roles?.map((role) => (
										<SelectItem key={role.id} value={role.id}>
											{role.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleInvite} disabled={inviteUser.isPending}>
							<Mail className="h-4 w-4 mr-2" />
							{inviteUser.isPending ? "Sending..." : "Send Invitation"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Suspend User Dialog */}
			<Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Suspend User</DialogTitle>
						<DialogDescription>
							Are you sure you want to suspend {selectedUser?.firstName} {selectedUser?.lastName}? They will lose access
							to the system immediately.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => selectedUser && suspendUser.mutate(selectedUser.id)}
							disabled={suspendUser.isPending}
						>
							{suspendUser.isPending ? "Suspending..." : "Suspend User"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

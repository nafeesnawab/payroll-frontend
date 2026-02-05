import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { MoreHorizontal, Plus, Shield, UserCog } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AdminUser, AdminRole } from "@/types/admin";
import { ADMIN_ROLE_LABELS } from "@/types/admin";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/ui/dialog";
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

export default function AdminUsersPage() {
	const queryClient = useQueryClient();
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [newUser, setNewUser] = useState({
		name: "",
		email: "",
		role: "" as AdminRole | "",
	});

	const { data: users, isLoading } = useQuery({
		queryKey: ["admin-users"],
		queryFn: async () => {
			const response = await axios.get("/api/admin/users");
			return response.data.data as AdminUser[];
		},
	});

	const createUser = useMutation({
		mutationFn: async (data: { name: string; email: string; role: AdminRole }) => {
			const response = await axios.post("/api/admin/users", data);
			return response.data;
		},
		onSuccess: () => {
			toast.success("Admin user created");
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			setAddDialogOpen(false);
			setNewUser({ name: "", email: "", role: "" });
		},
		onError: () => {
			toast.error("Failed to create user");
		},
	});

	const updateUserStatus = useMutation({
		mutationFn: async ({ id, status }: { id: string; status: "active" | "disabled" }) => {
			const response = await axios.put(`/api/admin/users/${id}`, { status });
			return response.data;
		},
		onSuccess: () => {
			toast.success("User status updated");
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
		},
		onError: () => {
			toast.error("Failed to update user");
		},
	});

	const resetCredentials = useMutation({
		mutationFn: async (id: string) => {
			const response = await axios.post(`/api/admin/users/${id}/reset`);
			return response.data;
		},
		onSuccess: () => {
			toast.success("Password reset email sent");
		},
		onError: () => {
			toast.error("Failed to reset credentials");
		},
	});

	const handleCreate = () => {
		if (!newUser.name || !newUser.email || !newUser.role) {
			toast.error("Please fill in all fields");
			return;
		}
		createUser.mutate({ ...newUser, role: newUser.role as AdminRole });
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return <Badge className="bg-green-100 text-green-800">Active</Badge>;
			case "disabled":
				return <Badge variant="destructive">Disabled</Badge>;
			case "pending":
				return <Badge variant="secondary">Pending</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const getRoleBadge = (role: AdminRole) => {
		switch (role) {
			case "super_admin":
				return <Badge className="bg-purple-100 text-purple-800">{ADMIN_ROLE_LABELS[role]}</Badge>;
			case "support_agent":
				return <Badge className="bg-blue-100 text-blue-800">{ADMIN_ROLE_LABELS[role]}</Badge>;
			case "auditor":
				return <Badge variant="outline">{ADMIN_ROLE_LABELS[role]}</Badge>;
			default:
				return <Badge variant="outline">{role}</Badge>;
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
						<UserCog className="h-6 w-6" />
						Admin Users
					</h1>
					<p className="text-muted-foreground">
						Manage platform admin access
					</p>
				</div>
				<Button onClick={() => setAddDialogOpen(true)}>
					<Plus className="h-4 w-4 mr-2" />
					Add Admin User
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Platform Administrators</CardTitle>
					<CardDescription>
						Users with access to the platform admin panel
					</CardDescription>
				</CardHeader>
				<CardContent>
					{users && users.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Last Login</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.map((user) => (
									<TableRow key={user.id}>
										<TableCell className="font-medium">{user.name}</TableCell>
										<TableCell className="text-muted-foreground">{user.email}</TableCell>
										<TableCell>{getRoleBadge(user.role)}</TableCell>
										<TableCell>{getStatusBadge(user.status)}</TableCell>
										<TableCell className="text-muted-foreground">
											{user.lastLogin
												? new Date(user.lastLogin).toLocaleString()
												: "Never"}
										</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={() => resetCredentials.mutate(user.id)}
													>
														Reset Password
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													{user.status === "active" ? (
														<DropdownMenuItem
															className="text-destructive"
															onClick={() =>
																updateUserStatus.mutate({ id: user.id, status: "disabled" })
															}
														>
															Disable User
														</DropdownMenuItem>
													) : (
														<DropdownMenuItem
															onClick={() =>
																updateUserStatus.mutate({ id: user.id, status: "active" })
															}
														>
															Enable User
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
						<p className="text-muted-foreground text-center py-8">No admin users</p>
					)}
				</CardContent>
			</Card>

			{/* Role Descriptions */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Shield className="h-4 w-4" />
						Role Permissions
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-3">
						<div className="p-4 border rounded-lg">
							<div className="flex items-center gap-2 mb-2">
								{getRoleBadge("super_admin")}
							</div>
							<p className="text-sm text-muted-foreground">
								Full platform access. Can modify settings, manage users, and perform all actions.
							</p>
						</div>
						<div className="p-4 border rounded-lg">
							<div className="flex items-center gap-2 mb-2">
								{getRoleBadge("support_agent")}
							</div>
							<p className="text-sm text-muted-foreground">
								Can search companies, view details, and assist customers. Limited write access.
							</p>
						</div>
						<div className="p-4 border rounded-lg">
							<div className="flex items-center gap-2 mb-2">
								{getRoleBadge("auditor")}
							</div>
							<p className="text-sm text-muted-foreground">
								Read-only access to all data and audit logs. Cannot make any changes.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Add User Dialog */}
			<Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add Admin User</DialogTitle>
						<DialogDescription>
							Create a new platform administrator account
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={newUser.name}
								onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
								placeholder="John Smith"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={newUser.email}
								onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
								placeholder="john@paypilot.co.za"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="role">Role</Label>
							<Select
								value={newUser.role}
								onValueChange={(v) => setNewUser({ ...newUser, role: v as AdminRole })}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select role" />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(ADMIN_ROLE_LABELS).map(([key, label]) => (
										<SelectItem key={key} value={key}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setAddDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleCreate} disabled={createUser.isPending}>
							{createUser.isPending ? "Creating..." : "Create User"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

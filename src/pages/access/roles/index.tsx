import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Copy, Edit, Key, MoreHorizontal, Plus, Shield, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { Role, CreateRoleInput } from "@/types/access";
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
import { Textarea } from "@/ui/textarea";

export default function RolesPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedRole, setSelectedRole] = useState<Role | null>(null);
	const [newRole, setNewRole] = useState({ name: "", description: "" });

	const { data: roles, isLoading } = useQuery({
		queryKey: ["access-roles"],
		queryFn: async () => {
			const response = await axios.get("/api/access/roles");
			return response.data.data as Role[];
		},
	});

	const createRole = useMutation({
		mutationFn: async (data: CreateRoleInput) => {
			const response = await axios.post("/api/access/roles", data);
			return response.data;
		},
		onSuccess: () => {
			toast.success("Role created successfully");
			queryClient.invalidateQueries({ queryKey: ["access-roles"] });
			setCreateDialogOpen(false);
			setNewRole({ name: "", description: "" });
		},
		onError: () => {
			toast.error("Failed to create role");
		},
	});

	const cloneRole = useMutation({
		mutationFn: async (role: Role) => {
			const response = await axios.post("/api/access/roles", {
				name: `${role.name} (Copy)`,
				description: role.description,
				permissions: role.permissions,
			});
			return response.data;
		},
		onSuccess: () => {
			toast.success("Role cloned successfully");
			queryClient.invalidateQueries({ queryKey: ["access-roles"] });
		},
		onError: () => {
			toast.error("Failed to clone role");
		},
	});

	const deleteRole = useMutation({
		mutationFn: async (id: string) => {
			await axios.delete(`/api/access/roles/${id}`);
		},
		onSuccess: () => {
			toast.success("Role deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["access-roles"] });
			setDeleteDialogOpen(false);
			setSelectedRole(null);
		},
		onError: () => {
			toast.error("Failed to delete role");
		},
	});

	const handleCreate = () => {
		if (!newRole.name.trim()) {
			toast.error("Role name is required");
			return;
		}
		createRole.mutate({
			name: newRole.name,
			description: newRole.description,
			permissions: [],
		});
	};

	const handleDelete = () => {
		if (selectedRole) {
			deleteRole.mutate(selectedRole.id);
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
						<Key className="h-6 w-6" />
						Role Management
					</h1>
					<p className="text-muted-foreground">Define permission bundles for users</p>
				</div>
				<Button onClick={() => setCreateDialogOpen(true)}>
					<Plus className="h-4 w-4 mr-2" />
					Create Role
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Roles</CardTitle>
					<CardDescription>System roles cannot be deleted. Custom roles can be modified or removed.</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Role Name</TableHead>
								<TableHead>Description</TableHead>
								<TableHead className="text-center">Users</TableHead>
								<TableHead>Type</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{roles?.map((role) => (
								<TableRow key={role.id}>
									<TableCell>
										<div className="flex items-center gap-2">
											<Shield className="h-4 w-4 text-muted-foreground" />
											<span className="font-medium">{role.name}</span>
										</div>
									</TableCell>
									<TableCell className="text-muted-foreground max-w-xs truncate">{role.description}</TableCell>
									<TableCell className="text-center">
										<Badge variant="secondary" className="gap-1">
											<Users className="h-3 w-3" />
											{role.userCount}
										</Badge>
									</TableCell>
									<TableCell>
										{role.isSystemRole ? <Badge>System</Badge> : <Badge variant="outline">Custom</Badge>}
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => navigate(`/access/roles/${role.id}`)}>
													<Edit className="h-4 w-4 mr-2" />
													Edit Permissions
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => cloneRole.mutate(role)}>
													<Copy className="h-4 w-4 mr-2" />
													Clone Role
												</DropdownMenuItem>
												{!role.isSystemRole && role.userCount === 0 && (
													<>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-destructive"
															onClick={() => {
																setSelectedRole(role);
																setDeleteDialogOpen(true);
															}}
														>
															<Trash2 className="h-4 w-4 mr-2" />
															Delete Role
														</DropdownMenuItem>
													</>
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

			{/* Create Role Dialog */}
			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Role</DialogTitle>
						<DialogDescription>Create a custom role with specific permissions</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Role Name</Label>
							<Input
								id="name"
								value={newRole.name}
								onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
								placeholder="e.g., Payroll Viewer"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={newRole.description}
								onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
								placeholder="Describe what this role can do..."
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleCreate} disabled={createRole.isPending}>
							{createRole.isPending ? "Creating..." : "Create Role"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Role</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete the role "{selectedRole?.name}"? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDelete} disabled={deleteRole.isPending}>
							{deleteRole.isPending ? "Deleting..." : "Delete Role"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

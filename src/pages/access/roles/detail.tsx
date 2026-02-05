import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, ArrowLeft, Key, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import type { ModuleName, Permission, PermissionAction, Role } from "@/types/access";
import { MODULE_LABELS, PERMISSION_LABELS } from "@/types/access";
import { Alert, AlertDescription } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";
import { Skeleton } from "@/ui/skeleton";
import { cn } from "@/utils";

const MODULES: ModuleName[] = [
	"dashboard",
	"employees",
	"payroll",
	"leave",
	"filings",
	"terminations",
	"settings",
	"access",
	"audit",
];

const MODULE_PERMISSIONS: Record<ModuleName, PermissionAction[]> = {
	dashboard: ["view"],
	employees: ["view", "create", "edit", "delete"],
	payroll: ["view", "create", "edit", "finalize", "delete"],
	leave: ["view", "create", "edit", "delete"],
	filings: ["view", "create", "edit", "submit"],
	terminations: ["view", "create", "edit", "finalize"],
	ess: ["view"],
	settings: ["view", "edit"],
	access: ["view", "create", "edit", "delete"],
	audit: ["view"],
};

const DANGEROUS_PERMISSIONS: Array<{ module: ModuleName; action: PermissionAction }> = [
	{ module: "payroll", action: "finalize" },
	{ module: "payroll", action: "delete" },
	{ module: "filings", action: "submit" },
	{ module: "terminations", action: "finalize" },
	{ module: "access", action: "edit" },
	{ module: "access", action: "delete" },
];

export default function RoleDetailPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const queryClient = useQueryClient();
	const [permissions, setPermissions] = useState<Permission[]>([]);
	const [hasChanges, setHasChanges] = useState(false);

	const { data: role, isLoading } = useQuery({
		queryKey: ["access-role", id],
		queryFn: async () => {
			const response = await axios.get(`/api/access/roles/${id}`);
			return response.data.data as Role;
		},
		enabled: !!id,
	});

	useEffect(() => {
		if (role) {
			setPermissions(role.permissions);
		}
	}, [role]);

	const updateRole = useMutation({
		mutationFn: async (perms: Permission[]) => {
			const response = await axios.put(`/api/access/roles/${id}`, { permissions: perms });
			return response.data;
		},
		onSuccess: () => {
			toast.success("Permissions updated successfully");
			queryClient.invalidateQueries({ queryKey: ["access-role", id] });
			queryClient.invalidateQueries({ queryKey: ["access-roles"] });
			setHasChanges(false);
		},
		onError: () => {
			toast.error("Failed to update permissions");
		},
	});

	const getModulePermissions = (module: ModuleName): PermissionAction[] => {
		const perm = permissions.find((p) => p.module === module);
		return perm?.actions || [];
	};

	const hasPermission = (module: ModuleName, action: PermissionAction): boolean => {
		return getModulePermissions(module).includes(action);
	};

	const togglePermission = (module: ModuleName, action: PermissionAction) => {
		setHasChanges(true);
		setPermissions((prev) => {
			const existing = prev.find((p) => p.module === module);
			if (existing) {
				const hasAction = existing.actions.includes(action);
				if (hasAction) {
					const newActions = existing.actions.filter((a) => a !== action);
					if (newActions.length === 0) {
						return prev.filter((p) => p.module !== module);
					}
					return prev.map((p) => (p.module === module ? { ...p, actions: newActions } : p));
				}
				return prev.map((p) => (p.module === module ? { ...p, actions: [...p.actions, action] } : p));
			}
			return [...prev, { module, actions: [action] }];
		});
	};

	const toggleModuleAll = (module: ModuleName) => {
		setHasChanges(true);
		const availableActions = MODULE_PERMISSIONS[module];
		const currentActions = getModulePermissions(module);
		const allSelected = availableActions.every((a) => currentActions.includes(a));

		setPermissions((prev) => {
			if (allSelected) {
				return prev.filter((p) => p.module !== module);
			}
			const existing = prev.find((p) => p.module === module);
			if (existing) {
				return prev.map((p) => (p.module === module ? { ...p, actions: [...availableActions] } : p));
			}
			return [...prev, { module, actions: [...availableActions] }];
		});
	};

	const isDangerous = (module: ModuleName, action: PermissionAction): boolean => {
		return DANGEROUS_PERMISSIONS.some((d) => d.module === module && d.action === action);
	};

	const handleSave = () => {
		updateRole.mutate(permissions);
	};

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-[600px]" />
			</div>
		);
	}

	if (!role) {
		return (
			<div className="p-6 text-center">
				<p className="text-muted-foreground">Role not found</p>
				<Button variant="outline" onClick={() => navigate("/access/roles")} className="mt-4">
					Back to Roles
				</Button>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => navigate("/access/roles")}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold flex items-center gap-2">
							<Key className="h-6 w-6" />
							{role.name}
						</h1>
						<p className="text-muted-foreground">{role.description}</p>
					</div>
					{role.isSystemRole && <Badge>System Role</Badge>}
				</div>
				<Button onClick={handleSave} disabled={!hasChanges || updateRole.isPending}>
					<Save className="h-4 w-4 mr-2" />
					{updateRole.isPending ? "Saving..." : "Save Changes"}
				</Button>
			</div>

			{hasChanges && (
				<Alert>
					<AlertDescription>You have unsaved changes. Click "Save Changes" to apply them.</AlertDescription>
				</Alert>
			)}

			<Card>
				<CardHeader>
					<CardTitle>Permission Matrix</CardTitle>
					<CardDescription>
						Configure what users with this role can do in each module.
						<span className="text-destructive ml-2">
							<AlertTriangle className="h-3 w-3 inline mr-1" />
							Red-highlighted permissions are high-risk.
						</span>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b">
									<th className="text-left py-3 px-4 font-medium">Module</th>
									{(["view", "create", "edit", "delete", "finalize", "submit"] as PermissionAction[]).map((action) => (
										<th key={action} className="text-center py-3 px-2 font-medium">
											{PERMISSION_LABELS[action]}
										</th>
									))}
									<th className="text-center py-3 px-2 font-medium">All</th>
								</tr>
							</thead>
							<tbody>
								{MODULES.map((module) => {
									const availableActions = MODULE_PERMISSIONS[module];
									const currentActions = getModulePermissions(module);
									const allSelected = availableActions.every((a) => currentActions.includes(a));
									const someSelected = currentActions.length > 0 && !allSelected;

									return (
										<tr key={module} className="border-b hover:bg-muted/50">
											<td className="py-3 px-4 font-medium">{MODULE_LABELS[module]}</td>
											{(["view", "create", "edit", "delete", "finalize", "submit"] as PermissionAction[]).map(
												(action) => {
													const available = availableActions.includes(action);
													const checked = hasPermission(module, action);
													const dangerous = isDangerous(module, action);

													return (
														<td key={action} className="text-center py-3 px-2">
															{available ? (
																<div className="flex justify-center">
																	<Checkbox
																		checked={checked}
																		onCheckedChange={() => togglePermission(module, action)}
																		className={cn(dangerous && checked && "border-destructive bg-destructive/10")}
																	/>
																</div>
															) : (
																<span className="text-muted-foreground">—</span>
															)}
														</td>
													);
												},
											)}
											<td className="text-center py-3 px-2">
												<div className="flex justify-center">
													<Checkbox
														checked={allSelected}
														onCheckedChange={() => toggleModuleAll(module)}
														className={cn(someSelected && "data-[state=checked]:bg-primary/50")}
													/>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			{/* Permission Summary */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Active Permissions Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-2">
						{permissions.length === 0 ? (
							<p className="text-muted-foreground">No permissions assigned</p>
						) : (
							permissions.map((perm) =>
								perm.actions.map((action) => (
									<Badge
										key={`${perm.module}-${action}`}
										variant={isDangerous(perm.module, action) ? "destructive" : "secondary"}
									>
										{MODULE_LABELS[perm.module]}: {PERMISSION_LABELS[action]}
									</Badge>
								)),
							)
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Building2, Calendar, Clock, Mail, Shield, User } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import type { SystemUser, Role } from "@/types/access";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";
import { Label } from "@/ui/label";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Separator } from "@/ui/separator";
import { Skeleton } from "@/ui/skeleton";

export default function UserDetailPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const queryClient = useQueryClient();
	const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
	const [companyAccess, setCompanyAccess] = useState<"all" | "specific">("all");
	const [hasChanges, setHasChanges] = useState(false);

	const { data: user, isLoading: loadingUser } = useQuery({
		queryKey: ["access-user", id],
		queryFn: async () => {
			const response = await axios.get(`/api/access/users/${id}`);
			return response.data.data as SystemUser;
		},
		enabled: !!id,
	});

	const { data: roles } = useQuery({
		queryKey: ["access-roles"],
		queryFn: async () => {
			const response = await axios.get("/api/access/roles");
			return response.data.data as Role[];
		},
	});

	const { data: recentActions } = useQuery({
		queryKey: ["user-recent-actions", id],
		queryFn: async () => {
			const response = await axios.get(`/api/audit-logs?userId=${id}&limit=5`);
			return response.data.data;
		},
		enabled: !!id,
	});

	useState(() => {
		if (user) {
			setSelectedRoles(user.roles);
			setCompanyAccess(user.companyAccess);
		}
	});

	const updateUser = useMutation({
		mutationFn: async (data: { roleIds: string[]; companyAccess: "all" | "specific" }) => {
			const response = await axios.put(`/api/access/users/${id}`, data);
			return response.data;
		},
		onSuccess: () => {
			toast.success("User updated successfully");
			queryClient.invalidateQueries({ queryKey: ["access-user", id] });
			queryClient.invalidateQueries({ queryKey: ["access-users"] });
			setHasChanges(false);
		},
		onError: () => {
			toast.error("Failed to update user");
		},
	});

	const toggleRole = (roleId: string) => {
		setHasChanges(true);
		setSelectedRoles((prev) =>
			prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
		);
	};

	const handleSave = () => {
		updateUser.mutate({
			roleIds: selectedRoles,
			companyAccess,
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

	if (loadingUser) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-96" />
			</div>
		);
	}

	if (!user) {
		return (
			<div className="p-6 text-center">
				<p className="text-muted-foreground">User not found</p>
				<Button variant="outline" onClick={() => navigate("/access/users")} className="mt-4">
					Back to Users
				</Button>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => navigate("/access/users")}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold flex items-center gap-2">
							<User className="h-6 w-6" />
							{user.firstName} {user.lastName}
						</h1>
						<p className="text-muted-foreground">{user.email}</p>
					</div>
					{getStatusBadge(user.status)}
				</div>
				<Button onClick={handleSave} disabled={!hasChanges || updateUser.isPending}>
					{updateUser.isPending ? "Saving..." : "Save Changes"}
				</Button>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* User Profile */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">User Profile</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-muted-foreground">First Name</p>
								<p className="font-medium">{user.firstName}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Last Name</p>
								<p className="font-medium">{user.lastName}</p>
							</div>
						</div>
						<div>
							<p className="text-sm text-muted-foreground flex items-center gap-1">
								<Mail className="h-3 w-3" /> Email
							</p>
							<p className="font-medium">{user.email}</p>
						</div>
						<Separator />
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-muted-foreground flex items-center gap-1">
									<Clock className="h-3 w-3" /> Last Login
								</p>
								<p className="font-medium">
									{user.lastLoginAt
										? new Date(user.lastLoginAt).toLocaleString()
										: "Never"}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground flex items-center gap-1">
									<Calendar className="h-3 w-3" /> Created
								</p>
								<p className="font-medium">
									{new Date(user.createdAt).toLocaleDateString()}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Company Access */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base flex items-center gap-2">
							<Building2 className="h-4 w-4" />
							Company Access
						</CardTitle>
						<CardDescription>
							Control which companies this user can access
						</CardDescription>
					</CardHeader>
					<CardContent>
						<RadioGroup
							value={companyAccess}
							onValueChange={(value: "all" | "specific") => {
								setCompanyAccess(value);
								setHasChanges(true);
							}}
						>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="all" id="all" />
								<Label htmlFor="all">All Companies</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="specific" id="specific" />
								<Label htmlFor="specific">Specific Companies Only</Label>
							</div>
						</RadioGroup>
						{companyAccess === "specific" && (
							<p className="text-sm text-muted-foreground mt-4">
								Company selection will be available in a future update.
							</p>
						)}
					</CardContent>
				</Card>

				{/* Assigned Roles */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base flex items-center gap-2">
							<Shield className="h-4 w-4" />
							Assigned Roles
						</CardTitle>
						<CardDescription>
							Select the roles for this user
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{roles?.map((role) => (
								<div key={role.id} className="flex items-center space-x-3">
									<Checkbox
										id={role.id}
										checked={selectedRoles.includes(role.id)}
										onCheckedChange={() => toggleRole(role.id)}
									/>
									<div className="flex-1">
										<Label htmlFor={role.id} className="font-medium cursor-pointer">
											{role.name}
										</Label>
										<p className="text-xs text-muted-foreground">{role.description}</p>
									</div>
									{role.isSystemRole && (
										<Badge variant="outline" className="text-xs">
											System
										</Badge>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Recent Actions */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Recent Actions</CardTitle>
						<CardDescription>Last 5 actions by this user</CardDescription>
					</CardHeader>
					<CardContent>
						{recentActions && recentActions.length > 0 ? (
							<div className="space-y-3">
								{recentActions.map((action: any) => (
									<div
										key={action.id}
										className="flex items-center justify-between text-sm"
									>
										<span>{action.actionLabel}</span>
										<span className="text-muted-foreground">
											{new Date(action.timestamp).toLocaleDateString()}
										</span>
									</div>
								))}
							</div>
						) : (
							<p className="text-muted-foreground text-center py-4">
								No recent actions
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CheckCircle2, Crown, Loader2, Plus, Shield, User, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const userSchema = z.object({
	email: z.string().email("Valid email required"),
	name: z.string().min(1, "Name is required"),
	role: z.enum(["admin", "viewer"]),
});

type UserFormValues = z.infer<typeof userSchema>;

interface SettingsUser {
	id: string;
	email: string;
	name: string;
	role: string;
	invitedAt: string;
	acceptedAt?: string;
}

const roleConfig: Record<string, { label: string; icon: typeof User; variant: "default" | "secondary" | "outline" }> = {
	owner: { label: "Owner", icon: Crown, variant: "default" },
	admin: { label: "Admin", icon: Shield, variant: "secondary" },
	viewer: { label: "Viewer", icon: User, variant: "outline" },
};

export default function UsersPage() {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const { data: users, isLoading } = useQuery({
		queryKey: ["settings", "users"],
		queryFn: async () => {
			const response = await axios.get("/api/settings/users");
			return response.data.data as SettingsUser[];
		},
	});

	const form = useForm<UserFormValues>({
		resolver: zodResolver(userSchema),
		defaultValues: { email: "", name: "", role: "viewer" },
	});

	const createMutation = useMutation({
		mutationFn: async (data: UserFormValues) => {
			const response = await axios.post("/api/settings/users", data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings", "users"] });
			toast.success("User invited");
			setOpen(false);
			form.reset();
		},
	});

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<div className="space-y-4">
					{[1, 2].map((i) => <Skeleton key={i} className="h-20" />)}
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Users className="h-6 w-6" />
						Users & Permissions
					</h1>
					<p className="text-muted-foreground">Manage access to this company</p>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button><Plus className="h-4 w-4 mr-2" />Invite User</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Invite User</DialogTitle>
						</DialogHeader>
						<Form {...form}>
							<form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
								<FormField control={form.control} name="name" render={({ field }) => (
									<FormItem>
										<FormLabel>Name *</FormLabel>
										<FormControl><Input {...field} /></FormControl>
										<FormMessage />
									</FormItem>
								)} />
								<FormField control={form.control} name="email" render={({ field }) => (
									<FormItem>
										<FormLabel>Email *</FormLabel>
										<FormControl><Input type="email" {...field} /></FormControl>
										<FormMessage />
									</FormItem>
								)} />
								<FormField control={form.control} name="role" render={({ field }) => (
									<FormItem>
										<FormLabel>Role *</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
											<SelectContent>
												<SelectItem value="admin">Admin - Full access</SelectItem>
												<SelectItem value="viewer">Viewer - Read only</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)} />
								<div className="flex justify-end gap-2 pt-4">
									<Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
									<Button type="submit" disabled={createMutation.isPending}>
										{createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
										Send Invite
									</Button>
								</div>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</div>

			<div className="space-y-4">
				{users?.map((user) => {
					const config = roleConfig[user.role] || roleConfig.viewer;
					const Icon = config.icon;
					return (
						<Card key={user.id}>
							<CardContent className="py-4 flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
										<Icon className="h-5 w-5" />
									</div>
									<div>
										<p className="font-medium">{user.name}</p>
										<p className="text-sm text-muted-foreground">{user.email}</p>
									</div>
								</div>
								<div className="flex items-center gap-3">
									{!user.acceptedAt && <Badge variant="outline">Pending</Badge>}
									<Badge variant={config.variant}>{config.label}</Badge>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}

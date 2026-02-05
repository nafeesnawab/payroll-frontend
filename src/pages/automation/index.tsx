import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Edit, MoreHorizontal, Pause, Play, Plus, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { AutomationRule, CreateAutomationInput } from "@/types/notifications";
import { TRIGGER_LABELS, ACTION_LABELS } from "@/types/notifications";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Textarea } from "@/ui/textarea";

export default function AutomationRulesPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [newRule, setNewRule] = useState({
		name: "",
		description: "",
		trigger: "",
		action: "",
	});

	const { data: rules, isLoading } = useQuery({
		queryKey: ["automation-rules"],
		queryFn: async () => {
			const response = await axios.get("/api/automation/rules");
			return response.data.data as AutomationRule[];
		},
	});

	const createRule = useMutation({
		mutationFn: async (data: CreateAutomationInput) => {
			const response = await axios.post("/api/automation/rules", data);
			return response.data;
		},
		onSuccess: (data) => {
			toast.success("Automation rule created");
			queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
			setCreateDialogOpen(false);
			setNewRule({ name: "", description: "", trigger: "", action: "" });
			navigate(`/automation/${data.data.id}`);
		},
		onError: () => {
			toast.error("Failed to create rule");
		},
	});

	const toggleStatus = useMutation({
		mutationFn: async ({ id, status }: { id: string; status: "active" | "paused" }) => {
			const response = await axios.put(`/api/automation/rules/${id}`, { status });
			return response.data;
		},
		onSuccess: () => {
			toast.success("Rule status updated");
			queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
		},
		onError: () => {
			toast.error("Failed to update rule");
		},
	});

	const handleCreate = () => {
		if (!newRule.name || !newRule.trigger || !newRule.action) {
			toast.error("Please fill in all required fields");
			return;
		}
		createRule.mutate({
			name: newRule.name,
			description: newRule.description,
			trigger: newRule.trigger as CreateAutomationInput["trigger"],
			conditions: [],
			action: newRule.action as CreateAutomationInput["action"],
			actionConfig: {},
		});
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return <Badge className="bg-green-100 text-green-800">Active</Badge>;
			case "paused":
				return <Badge variant="secondary">Paused</Badge>;
			case "draft":
				return <Badge variant="outline">Draft</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
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

	const activeRules = rules?.filter((r) => r.status === "active").length || 0;
	const pausedRules = rules?.filter((r) => r.status === "paused").length || 0;

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Zap className="h-6 w-6" />
						Automation Rules
					</h1>
					<p className="text-muted-foreground">Automate actions based on system events</p>
				</div>
				<Button onClick={() => setCreateDialogOpen(true)}>
					<Plus className="h-4 w-4 mr-2" />
					Create Rule
				</Button>
			</div>

			{/* Summary */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Total Rules</CardDescription>
						<CardTitle className="text-3xl">{rules?.length || 0}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<Play className="h-4 w-4 text-green-600" />
							Active
						</CardDescription>
						<CardTitle className="text-3xl text-green-600">{activeRules}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<Pause className="h-4 w-4" />
							Paused
						</CardDescription>
						<CardTitle className="text-3xl">{pausedRules}</CardTitle>
					</CardHeader>
				</Card>
			</div>

			{/* Rules Table */}
			<Card>
				<CardHeader>
					<CardTitle>Rules</CardTitle>
					<CardDescription>Automation rules trigger actions when specific events occur</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Rule Name</TableHead>
								<TableHead>Trigger</TableHead>
								<TableHead>Action</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-center">Triggered</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rules?.map((rule) => (
								<TableRow key={rule.id}>
									<TableCell>
										<div>
											<p className="font-medium">{rule.name}</p>
											<p className="text-xs text-muted-foreground">{rule.description}</p>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant="outline">{rule.triggerLabel}</Badge>
									</TableCell>
									<TableCell>
										<Badge variant="secondary">{rule.actionLabel}</Badge>
									</TableCell>
									<TableCell>{getStatusBadge(rule.status)}</TableCell>
									<TableCell className="text-center">
										{rule.triggerCount}
										{rule.lastTriggeredAt && (
											<p className="text-xs text-muted-foreground">
												Last: {new Date(rule.lastTriggeredAt).toLocaleDateString()}
											</p>
										)}
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => navigate(`/automation/${rule.id}`)}>
													<Edit className="h-4 w-4 mr-2" />
													Edit
												</DropdownMenuItem>
												{rule.status === "active" ? (
													<DropdownMenuItem onClick={() => toggleStatus.mutate({ id: rule.id, status: "paused" })}>
														<Pause className="h-4 w-4 mr-2" />
														Pause
													</DropdownMenuItem>
												) : (
													<DropdownMenuItem onClick={() => toggleStatus.mutate({ id: rule.id, status: "active" })}>
														<Play className="h-4 w-4 mr-2" />
														Activate
													</DropdownMenuItem>
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
							{(!rules || rules.length === 0) && (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
										No automation rules created yet
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Create Rule Dialog */}
			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Automation Rule</DialogTitle>
						<DialogDescription>Define a new automation that triggers actions based on events</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Rule Name</Label>
							<Input
								id="name"
								value={newRule.name}
								onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
								placeholder="e.g., Notify on Payroll Finalization"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={newRule.description}
								onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
								placeholder="What does this automation do?"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="trigger">Trigger Event</Label>
							<Select value={newRule.trigger} onValueChange={(value) => setNewRule({ ...newRule, trigger: value })}>
								<SelectTrigger>
									<SelectValue placeholder="Select trigger" />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(TRIGGER_LABELS).map(([key, label]) => (
										<SelectItem key={key} value={key}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="action">Action</Label>
							<Select value={newRule.action} onValueChange={(value) => setNewRule({ ...newRule, action: value })}>
								<SelectTrigger>
									<SelectValue placeholder="Select action" />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(ACTION_LABELS).map(([key, label]) => (
										<SelectItem key={key} value={key}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleCreate} disabled={createRule.isPending}>
							{createRule.isPending ? "Creating..." : "Create & Configure"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

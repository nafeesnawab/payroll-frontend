import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Play, Save, Trash2, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import type { AutomationAction, AutomationCondition, AutomationRule, AutomationTrigger } from "@/types/notifications";
import { ACTION_LABELS, TRIGGER_LABELS } from "@/types/notifications";
import { Alert, AlertDescription } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Separator } from "@/ui/separator";
import { Skeleton } from "@/ui/skeleton";
import { Textarea } from "@/ui/textarea";

export default function AutomationDetailPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const queryClient = useQueryClient();
	const [hasChanges, setHasChanges] = useState(false);
	const [rule, setRule] = useState<Partial<AutomationRule>>({});
	const [conditions, setConditions] = useState<AutomationCondition[]>([]);

	const { data, isLoading } = useQuery({
		queryKey: ["automation-rule", id],
		queryFn: async () => {
			const response = await axios.get(`/api/automation/rules/${id}`);
			return response.data.data as AutomationRule;
		},
		enabled: !!id,
	});

	useEffect(() => {
		if (data) {
			setRule(data);
			setConditions(data.conditions || []);
		}
	}, [data]);

	const updateRule = useMutation({
		mutationFn: async (updates: Partial<AutomationRule>) => {
			const response = await axios.put(`/api/automation/rules/${id}`, updates);
			return response.data;
		},
		onSuccess: () => {
			toast.success("Rule updated successfully");
			queryClient.invalidateQueries({ queryKey: ["automation-rule", id] });
			queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
			setHasChanges(false);
		},
		onError: () => {
			toast.error("Failed to update rule");
		},
	});

	const testRule = useMutation({
		mutationFn: async () => {
			const response = await axios.post(`/api/automation/rules/${id}/test`);
			return response.data;
		},
		onSuccess: () => {
			toast.success("Test completed - check notification logs");
		},
		onError: () => {
			toast.error("Test failed");
		},
	});

	const handleSave = () => {
		updateRule.mutate({
			...rule,
			conditions,
		});
	};

	const addCondition = () => {
		setConditions([...conditions, { field: "", operator: "equals", value: "" }]);
		setHasChanges(true);
	};

	const updateCondition = (index: number, updates: Partial<AutomationCondition>) => {
		setConditions((prev) => prev.map((c, i) => (i === index ? { ...c, ...updates } : c)));
		setHasChanges(true);
	};

	const removeCondition = (index: number) => {
		setConditions((prev) => prev.filter((_, i) => i !== index));
		setHasChanges(true);
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

	if (!data) {
		return (
			<div className="p-6 text-center">
				<p className="text-muted-foreground">Rule not found</p>
				<Button variant="outline" onClick={() => navigate("/automation")} className="mt-4">
					Back to Automation
				</Button>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => navigate("/automation")}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold flex items-center gap-2">
							<Zap className="h-6 w-6" />
							{data.name}
						</h1>
						<p className="text-muted-foreground">{data.description}</p>
					</div>
					{getStatusBadge(data.status)}
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => testRule.mutate()} disabled={testRule.isPending}>
						<Play className="h-4 w-4 mr-2" />
						{testRule.isPending ? "Testing..." : "Test Rule"}
					</Button>
					<Button onClick={handleSave} disabled={!hasChanges || updateRule.isPending}>
						<Save className="h-4 w-4 mr-2" />
						{updateRule.isPending ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Basic Info */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Basic Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Rule Name</Label>
							<Input
								id="name"
								value={rule.name || ""}
								onChange={(e) => {
									setRule({ ...rule, name: e.target.value });
									setHasChanges(true);
								}}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={rule.description || ""}
								onChange={(e) => {
									setRule({ ...rule, description: e.target.value });
									setHasChanges(true);
								}}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Statistics */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Statistics</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-muted-foreground">Times Triggered</p>
								<p className="text-2xl font-bold">{data.triggerCount}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Last Triggered</p>
								<p className="font-medium">
									{data.lastTriggeredAt ? new Date(data.lastTriggeredAt).toLocaleString() : "Never"}
								</p>
							</div>
						</div>
						<Separator />
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground">Created</p>
								<p>{new Date(data.createdAt).toLocaleDateString()}</p>
							</div>
							<div>
								<p className="text-muted-foreground">Updated</p>
								<p>{new Date(data.updatedAt).toLocaleDateString()}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Trigger */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Trigger Event</CardTitle>
						<CardDescription>When should this automation run?</CardDescription>
					</CardHeader>
					<CardContent>
						<Select
							value={rule.trigger}
							onValueChange={(value) => {
								setRule({ ...rule, trigger: value as AutomationTrigger });
								setHasChanges(true);
							}}
						>
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
					</CardContent>
				</Card>

				{/* Action */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Action</CardTitle>
						<CardDescription>What should happen when triggered?</CardDescription>
					</CardHeader>
					<CardContent>
						<Select
							value={rule.action}
							onValueChange={(value) => {
								setRule({ ...rule, action: value as AutomationAction });
								setHasChanges(true);
							}}
						>
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
					</CardContent>
				</Card>
			</div>

			{/* Conditions */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-base">Conditions (Optional)</CardTitle>
							<CardDescription>Add conditions to filter when this automation should run</CardDescription>
						</div>
						<Button variant="outline" size="sm" onClick={addCondition}>
							Add Condition
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{conditions.length === 0 ? (
						<p className="text-muted-foreground text-center py-4">
							No conditions - automation will run for all matching events
						</p>
					) : (
						<div className="space-y-3">
							{conditions.map((condition, index) => (
								<div key={`condition-${condition.field}-${index}`} className="flex gap-3 items-center">
									<Select value={condition.field} onValueChange={(value) => updateCondition(index, { field: value })}>
										<SelectTrigger className="w-40">
											<SelectValue placeholder="Field" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="role">Role</SelectItem>
											<SelectItem value="company">Company</SelectItem>
											<SelectItem value="pay_frequency">Pay Frequency</SelectItem>
											<SelectItem value="department">Department</SelectItem>
										</SelectContent>
									</Select>
									<Select
										value={condition.operator}
										onValueChange={(value) =>
											updateCondition(index, { operator: value as AutomationCondition["operator"] })
										}
									>
										<SelectTrigger className="w-32">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="equals">Equals</SelectItem>
											<SelectItem value="not_equals">Not Equals</SelectItem>
											<SelectItem value="contains">Contains</SelectItem>
										</SelectContent>
									</Select>
									<Input
										value={condition.value}
										onChange={(e) => updateCondition(index, { value: e.target.value })}
										placeholder="Value"
										className="flex-1"
									/>
									<Button variant="ghost" size="icon" onClick={() => removeCondition(index)}>
										<Trash2 className="h-4 w-4 text-destructive" />
									</Button>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<Alert>
				<AlertDescription>
					<strong>Test Mode:</strong> Use the "Test Rule" button to simulate this automation without affecting live
					data. Test notifications will be sent to your account only.
				</AlertDescription>
			</Alert>
		</div>
	);
}

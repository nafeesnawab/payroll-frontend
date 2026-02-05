import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Lock, Save, Settings, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { GroupSetting, InheritanceMode } from "@/types/group";
import { SETTING_CATEGORIES } from "@/types/group";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export default function GroupSettingsPage() {
	const queryClient = useQueryClient();
	const [settings, setSettings] = useState<GroupSetting[]>([]);
	const [hasChanges, setHasChanges] = useState(false);

	const { data, isLoading } = useQuery({
		queryKey: ["group-settings"],
		queryFn: async () => {
			const response = await axios.get("/api/group/settings");
			return response.data.data as GroupSetting[];
		},
	});

	useEffect(() => {
		if (data) {
			setSettings(data);
		}
	}, [data]);

	const saveSettings = useMutation({
		mutationFn: async (updatedSettings: GroupSetting[]) => {
			const response = await axios.put("/api/group/settings", { settings: updatedSettings });
			return response.data;
		},
		onSuccess: () => {
			toast.success("Group settings saved");
			queryClient.invalidateQueries({ queryKey: ["group-settings"] });
			setHasChanges(false);
		},
		onError: () => {
			toast.error("Failed to save settings");
		},
	});

	const updateInheritance = (id: string, mode: InheritanceMode) => {
		setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, inheritanceMode: mode } : s)));
		setHasChanges(true);
	};

	const getInheritanceBadge = (mode: InheritanceMode) => {
		switch (mode) {
			case "enforced":
				return (
					<Badge className="bg-red-100 text-red-800 gap-1">
						<Lock className="h-3 w-3" />
						Enforced
					</Badge>
				);
			case "override_allowed":
				return (
					<Badge className="bg-amber-100 text-amber-800 gap-1">
						<Unlock className="h-3 w-3" />
						Override Allowed
					</Badge>
				);
			case "company_only":
				return <Badge variant="secondary">Company Only</Badge>;
			default:
				return <Badge variant="outline">{mode}</Badge>;
		}
	};

	const groupedSettings = settings.reduce(
		(acc, setting) => {
			if (!acc[setting.category]) {
				acc[setting.category] = [];
			}
			acc[setting.category].push(setting);
			return acc;
		},
		{} as Record<string, GroupSetting[]>,
	);

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
						<Settings className="h-6 w-6" />
						Group Settings
					</h1>
					<p className="text-muted-foreground">Define shared configuration across all companies</p>
				</div>
				<Button onClick={() => saveSettings.mutate(settings)} disabled={!hasChanges || saveSettings.isPending}>
					<Save className="h-4 w-4 mr-2" />
					{saveSettings.isPending ? "Saving..." : "Save Changes"}
				</Button>
			</div>

			{/* Inheritance Legend */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-wrap gap-6">
						<div className="flex items-center gap-2">
							{getInheritanceBadge("enforced")}
							<span className="text-sm text-muted-foreground">Companies must use group value</span>
						</div>
						<div className="flex items-center gap-2">
							{getInheritanceBadge("override_allowed")}
							<span className="text-sm text-muted-foreground">Companies can override if needed</span>
						</div>
						<div className="flex items-center gap-2">
							{getInheritanceBadge("company_only")}
							<span className="text-sm text-muted-foreground">Each company manages independently</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Settings by Category */}
			{SETTING_CATEGORIES.map((category) => {
				const categorySettings = groupedSettings[category] || [];
				if (categorySettings.length === 0) return null;

				return (
					<Card key={category}>
						<CardHeader>
							<CardTitle className="text-base">{category}</CardTitle>
							<CardDescription>Configure how {category.toLowerCase()} are inherited across companies</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Setting</TableHead>
										<TableHead>Group Value</TableHead>
										<TableHead>Inheritance Mode</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{categorySettings.map((setting) => (
										<TableRow key={setting.id}>
											<TableCell>
												<div>
													<p className="font-medium">{setting.name}</p>
													<p className="text-xs text-muted-foreground">{setting.description}</p>
												</div>
											</TableCell>
											<TableCell>
												<code className="text-sm bg-muted px-2 py-1 rounded">{String(setting.groupValue)}</code>
											</TableCell>
											<TableCell>
												<Select
													value={setting.inheritanceMode}
													onValueChange={(v) => updateInheritance(setting.id, v as InheritanceMode)}
												>
													<SelectTrigger className="w-44">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="enforced">
															<div className="flex items-center gap-2">
																<Lock className="h-3 w-3" />
																Enforced
															</div>
														</SelectItem>
														<SelectItem value="override_allowed">
															<div className="flex items-center gap-2">
																<Unlock className="h-3 w-3" />
																Override Allowed
															</div>
														</SelectItem>
														<SelectItem value="company_only">Company Only</SelectItem>
													</SelectContent>
												</Select>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

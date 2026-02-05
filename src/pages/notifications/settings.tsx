import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, Bell, Mail, Save, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { NotificationSetting, NotificationChannel, RecipientType } from "@/types/notifications";
import { CATEGORY_LABELS } from "@/types/notifications";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";
import { Label } from "@/ui/label";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";

export default function NotificationSettingsPage() {
	const queryClient = useQueryClient();
	const [settings, setSettings] = useState<NotificationSetting[]>([]);
	const [hasChanges, setHasChanges] = useState(false);

	const { data, isLoading } = useQuery({
		queryKey: ["notification-settings"],
		queryFn: async () => {
			const response = await axios.get("/api/notifications/settings");
			return response.data.data as NotificationSetting[];
		},
	});

	useEffect(() => {
		if (data) {
			setSettings(data);
		}
	}, [data]);

	const updateSettings = useMutation({
		mutationFn: async (updatedSettings: NotificationSetting[]) => {
			const response = await axios.put("/api/notifications/settings", { settings: updatedSettings });
			return response.data;
		},
		onSuccess: () => {
			toast.success("Settings saved successfully");
			queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
			setHasChanges(false);
		},
		onError: () => {
			toast.error("Failed to save settings");
		},
	});

	const toggleEnabled = (id: string) => {
		setSettings((prev) => prev.map((s) => (s.id === id && !s.isCritical ? { ...s, enabled: !s.enabled } : s)));
		setHasChanges(true);
	};

	const toggleChannel = (id: string, channel: NotificationChannel) => {
		setSettings((prev) =>
			prev.map((s) => {
				if (s.id !== id) return s;
				const hasChannel = s.channels.includes(channel);
				return {
					...s,
					channels: hasChannel ? s.channels.filter((c) => c !== channel) : [...s.channels, channel],
				};
			}),
		);
		setHasChanges(true);
	};

	const toggleRecipient = (id: string, recipient: RecipientType) => {
		setSettings((prev) =>
			prev.map((s) => {
				if (s.id !== id) return s;
				const hasRecipient = s.recipients.includes(recipient);
				return {
					...s,
					recipients: hasRecipient ? s.recipients.filter((r) => r !== recipient) : [...s.recipients, recipient],
				};
			}),
		);
		setHasChanges(true);
	};

	const handleSave = () => {
		updateSettings.mutate(settings);
	};

	const groupedSettings = settings.reduce(
		(acc, setting) => {
			if (!acc[setting.category]) {
				acc[setting.category] = [];
			}
			acc[setting.category].push(setting);
			return acc;
		},
		{} as Record<string, NotificationSetting[]>,
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
						<Bell className="h-6 w-6" />
						Notification Settings
					</h1>
					<p className="text-muted-foreground">Configure notification triggers, recipients, and channels</p>
				</div>
				<Button onClick={handleSave} disabled={!hasChanges || updateSettings.isPending}>
					<Save className="h-4 w-4 mr-2" />
					{updateSettings.isPending ? "Saving..." : "Save Changes"}
				</Button>
			</div>

			{Object.entries(groupedSettings).map(([category, categorySettings]) => (
				<Card key={category}>
					<CardHeader>
						<CardTitle>{CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}</CardTitle>
						<CardDescription>
							{category === "payroll" && "Notifications related to payroll processing"}
							{category === "leave" && "Notifications for leave requests and approvals"}
							{category === "filings" && "Statutory filing reminders and alerts"}
							{category === "general" && "General system notifications"}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{categorySettings.map((setting) => (
							<div key={setting.id} className="border rounded-lg p-4 space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<Switch
											checked={setting.enabled}
											onCheckedChange={() => toggleEnabled(setting.id)}
											disabled={setting.isCritical}
										/>
										<div>
											<div className="flex items-center gap-2">
												<span className="font-medium">{setting.typeLabel}</span>
												{setting.isCritical && (
													<Badge variant="destructive" className="text-xs gap-1">
														<Shield className="h-3 w-3" />
														Critical
													</Badge>
												)}
											</div>
											<p className="text-sm text-muted-foreground">{setting.description}</p>
										</div>
									</div>
								</div>

								{setting.enabled && (
									<div className="grid gap-4 md:grid-cols-2 pl-12">
										<div className="space-y-2">
											<Label className="text-xs text-muted-foreground">Channels</Label>
											<div className="flex gap-4">
												<div className="flex items-center gap-2">
													<Checkbox
														id={`${setting.id}-email`}
														checked={setting.channels.includes("email")}
														onCheckedChange={() => toggleChannel(setting.id, "email")}
													/>
													<Label htmlFor={`${setting.id}-email`} className="flex items-center gap-1">
														<Mail className="h-3 w-3" /> Email
													</Label>
												</div>
												<div className="flex items-center gap-2">
													<Checkbox
														id={`${setting.id}-inapp`}
														checked={setting.channels.includes("in_app")}
														onCheckedChange={() => toggleChannel(setting.id, "in_app")}
													/>
													<Label htmlFor={`${setting.id}-inapp`} className="flex items-center gap-1">
														<Bell className="h-3 w-3" /> In-App
													</Label>
												</div>
											</div>
										</div>

										<div className="space-y-2">
											<Label className="text-xs text-muted-foreground">Recipients</Label>
											<div className="flex flex-wrap gap-4">
												<div className="flex items-center gap-2">
													<Checkbox
														id={`${setting.id}-admins`}
														checked={setting.recipients.includes("admins")}
														onCheckedChange={() => toggleRecipient(setting.id, "admins")}
													/>
													<Label htmlFor={`${setting.id}-admins`}>Admins</Label>
												</div>
												<div className="flex items-center gap-2">
													<Checkbox
														id={`${setting.id}-managers`}
														checked={setting.recipients.includes("managers")}
														onCheckedChange={() => toggleRecipient(setting.id, "managers")}
													/>
													<Label htmlFor={`${setting.id}-managers`}>Managers</Label>
												</div>
												<div className="flex items-center gap-2">
													<Checkbox
														id={`${setting.id}-employees`}
														checked={setting.recipients.includes("employees")}
														onCheckedChange={() => toggleRecipient(setting.id, "employees")}
													/>
													<Label htmlFor={`${setting.id}-employees`}>Employees</Label>
												</div>
											</div>
										</div>
									</div>
								)}
							</div>
						))}
					</CardContent>
				</Card>
			))}

			<Card className="border-amber-200 bg-amber-50">
				<CardContent className="pt-6">
					<div className="flex items-start gap-3">
						<AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
						<div>
							<p className="font-medium text-amber-800">Critical Notifications</p>
							<p className="text-sm text-amber-700">
								Notifications marked as "Critical" cannot be disabled. These are essential for compliance and system
								integrity.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

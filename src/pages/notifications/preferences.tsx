import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Bell, Mail, Save, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserNotificationPreference } from "@/types/notifications";
import { Alert, AlertDescription } from "@/ui/alert";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";

export default function NotificationPreferencesPage() {
	const queryClient = useQueryClient();
	const [preferences, setPreferences] = useState<UserNotificationPreference[]>([]);
	const [hasChanges, setHasChanges] = useState(false);

	const { data, isLoading } = useQuery({
		queryKey: ["notification-preferences"],
		queryFn: async () => {
			const response = await axios.get("/api/notifications/preferences");
			return response.data.data as UserNotificationPreference[];
		},
	});

	useEffect(() => {
		if (data) {
			setPreferences(data);
		}
	}, [data]);

	const updatePreferences = useMutation({
		mutationFn: async (prefs: UserNotificationPreference[]) => {
			const response = await axios.put("/api/notifications/preferences", { preferences: prefs });
			return response.data;
		},
		onSuccess: () => {
			toast.success("Preferences saved successfully");
			queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
			setHasChanges(false);
		},
		onError: () => {
			toast.error("Failed to save preferences");
		},
	});

	const togglePreference = (category: string, channel: "email" | "inApp") => {
		setPreferences((prev) =>
			prev.map((p) => {
				if (p.category !== category) return p;
				return {
					...p,
					emailEnabled: channel === "email" ? !p.emailEnabled : p.emailEnabled,
					inAppEnabled: channel === "inApp" ? !p.inAppEnabled : p.inAppEnabled,
				};
			}),
		);
		setHasChanges(true);
	};

	const handleSave = () => {
		updatePreferences.mutate(preferences);
	};

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64" />
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Bell className="h-6 w-6" />
						My Notification Preferences
					</h1>
					<p className="text-muted-foreground">Control how you receive notifications</p>
				</div>
				<Button onClick={handleSave} disabled={!hasChanges || updatePreferences.isPending}>
					<Save className="h-4 w-4 mr-2" />
					{updatePreferences.isPending ? "Saving..." : "Save Changes"}
				</Button>
			</div>

			<Alert>
				<Shield className="h-4 w-4" />
				<AlertDescription>
					System-critical notifications (compliance alerts, security) cannot be disabled and will always be delivered.
				</AlertDescription>
			</Alert>

			<Card>
				<CardHeader>
					<CardTitle>Notification Channels</CardTitle>
					<CardDescription>Choose how you want to receive notifications for each category</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-1">
						{/* Header */}
						<div className="grid grid-cols-3 gap-4 py-3 border-b font-medium text-sm text-muted-foreground">
							<div>Category</div>
							<div className="flex items-center justify-center gap-2">
								<Mail className="h-4 w-4" /> Email
							</div>
							<div className="flex items-center justify-center gap-2">
								<Bell className="h-4 w-4" /> In-App
							</div>
						</div>

						{/* Preferences */}
						{preferences.map((pref) => (
							<div key={pref.category} className="grid grid-cols-3 gap-4 py-4 border-b last:border-0 items-center">
								<div className="font-medium">{pref.categoryLabel}</div>
								<div className="flex justify-center">
									<Switch
										checked={pref.emailEnabled}
										onCheckedChange={() => togglePreference(pref.category, "email")}
									/>
								</div>
								<div className="flex justify-center">
									<Switch
										checked={pref.inAppEnabled}
										onCheckedChange={() => togglePreference(pref.category, "inApp")}
									/>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">What You'll Receive</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 text-sm">
					<div>
						<p className="font-medium">Payroll</p>
						<p className="text-muted-foreground">Payslip releases, payroll finalization notices</p>
					</div>
					<div>
						<p className="font-medium">Leave</p>
						<p className="text-muted-foreground">Leave request updates, approval/rejection notices</p>
					</div>
					<div>
						<p className="font-medium">General</p>
						<p className="text-muted-foreground">Profile updates, system announcements, reminders</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, Save, Settings, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SystemSettings } from "@/types/admin";
import { Alert, AlertDescription } from "@/ui/alert";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Separator } from "@/ui/separator";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";

export default function SystemSettingsPage() {
	const queryClient = useQueryClient();
	const [hasChanges, setHasChanges] = useState(false);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [settings, setSettings] = useState<SystemSettings | null>(null);

	const { data, isLoading } = useQuery({
		queryKey: ["admin-settings"],
		queryFn: async () => {
			const response = await axios.get("/api/admin/settings");
			return response.data.data as SystemSettings;
		},
	});

	useEffect(() => {
		if (data) {
			setSettings(data);
		}
	}, [data]);

	const saveSettings = useMutation({
		mutationFn: async (updatedSettings: SystemSettings) => {
			const response = await axios.put("/api/admin/settings", updatedSettings);
			return response.data;
		},
		onSuccess: () => {
			toast.success("System settings saved");
			queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
			setHasChanges(false);
			setConfirmDialogOpen(false);
		},
		onError: () => {
			toast.error("Failed to save settings");
		},
	});

	const handleSave = () => {
		if (settings) {
			saveSettings.mutate(settings);
		}
	};

	const updatePayroll = (key: keyof SystemSettings["payroll"], value: unknown) => {
		if (settings) {
			setSettings({ ...settings, payroll: { ...settings.payroll, [key]: value } });
			setHasChanges(true);
		}
	};

	const updateCompliance = (key: keyof SystemSettings["compliance"], value: unknown) => {
		if (settings) {
			setSettings({ ...settings, compliance: { ...settings.compliance, [key]: value } });
			setHasChanges(true);
		}
	};

	const updateSecurity = (key: keyof SystemSettings["security"], value: unknown) => {
		if (settings) {
			setSettings({ ...settings, security: { ...settings.security, [key]: value } });
			setHasChanges(true);
		}
	};

	const updatePerformance = (key: keyof SystemSettings["performance"], value: unknown) => {
		if (settings) {
			setSettings({ ...settings, performance: { ...settings.performance, [key]: value } });
			setHasChanges(true);
		}
	};

	if (isLoading || !settings) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-96" />
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<Alert variant="destructive" className="bg-red-50 border-red-200">
				<Shield className="h-4 w-4" />
				<AlertDescription className="text-red-800">
					Changes to system settings affect all companies on the platform.
				</AlertDescription>
			</Alert>

			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Settings className="h-6 w-6" />
						System Settings
					</h1>
					<p className="text-muted-foreground">Configure platform-wide defaults and limits</p>
				</div>
				<Button onClick={() => setConfirmDialogOpen(true)} disabled={!hasChanges}>
					<Save className="h-4 w-4 mr-2" />
					Save Changes
				</Button>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				{/* Payroll Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Payroll</CardTitle>
						<CardDescription>Default payroll calculation settings</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label>Default Tax Year</Label>
							<Select value={settings.payroll.defaultTaxYear} onValueChange={(v) => updatePayroll("defaultTaxYear", v)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="2024">2024</SelectItem>
									<SelectItem value="2025">2025</SelectItem>
									<SelectItem value="2026">2026</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Calculation Precision (decimal places)</Label>
							<Input
								type="number"
								min={2}
								max={6}
								value={settings.payroll.calculationPrecision}
								onChange={(e) => updatePayroll("calculationPrecision", Number(e.target.value))}
							/>
						</div>
						<div className="space-y-2">
							<Label>Rounding Rule</Label>
							<Select value={settings.payroll.roundingRule} onValueChange={(v) => updatePayroll("roundingRule", v)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="round">Round (nearest)</SelectItem>
									<SelectItem value="floor">Floor (down)</SelectItem>
									<SelectItem value="ceil">Ceil (up)</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Compliance Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Compliance</CardTitle>
						<CardDescription>Default statutory rates and windows</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label>PAYE Rate (%)</Label>
								<Input
									type="number"
									step={0.1}
									value={settings.compliance.defaultPayeRate}
									onChange={(e) => updateCompliance("defaultPayeRate", Number(e.target.value))}
								/>
							</div>
							<div className="space-y-2">
								<Label>UIF Rate (%)</Label>
								<Input
									type="number"
									step={0.1}
									value={settings.compliance.defaultUifRate}
									onChange={(e) => updateCompliance("defaultUifRate", Number(e.target.value))}
								/>
							</div>
							<div className="space-y-2">
								<Label>SDL Rate (%)</Label>
								<Input
									type="number"
									step={0.1}
									value={settings.compliance.defaultSdlRate}
									onChange={(e) => updateCompliance("defaultSdlRate", Number(e.target.value))}
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label>Filing Window (days before due)</Label>
							<Input
								type="number"
								min={1}
								max={30}
								value={settings.compliance.filingWindowDays}
								onChange={(e) => updateCompliance("filingWindowDays", Number(e.target.value))}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Security Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Security</CardTitle>
						<CardDescription>Authentication and session policies</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label>Minimum Password Length</Label>
							<Input
								type="number"
								min={8}
								max={32}
								value={settings.security.minPasswordLength}
								onChange={(e) => updateSecurity("minPasswordLength", Number(e.target.value))}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div>
								<Label>Require 2FA</Label>
								<p className="text-xs text-muted-foreground">Enforce two-factor authentication for all users</p>
							</div>
							<Switch
								checked={settings.security.require2FA}
								onCheckedChange={(checked) => updateSecurity("require2FA", checked)}
							/>
						</div>
						<Separator />
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Session Timeout (minutes)</Label>
								<Input
									type="number"
									min={5}
									max={480}
									value={settings.security.sessionTimeoutMinutes}
									onChange={(e) => updateSecurity("sessionTimeoutMinutes", Number(e.target.value))}
								/>
							</div>
							<div className="space-y-2">
								<Label>Max Login Attempts</Label>
								<Input
									type="number"
									min={3}
									max={10}
									value={settings.security.maxLoginAttempts}
									onChange={(e) => updateSecurity("maxLoginAttempts", Number(e.target.value))}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Performance Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Performance</CardTitle>
						<CardDescription>System limits and thresholds</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label>Max Background Jobs (concurrent)</Label>
							<Input
								type="number"
								min={1}
								max={100}
								value={settings.performance.maxBackgroundJobs}
								onChange={(e) => updatePerformance("maxBackgroundJobs", Number(e.target.value))}
							/>
						</div>
						<div className="space-y-2">
							<Label>Max File Upload Size (MB)</Label>
							<Input
								type="number"
								min={1}
								max={100}
								value={settings.performance.maxFileUploadMB}
								onChange={(e) => updatePerformance("maxFileUploadMB", Number(e.target.value))}
							/>
						</div>
						<div className="space-y-2">
							<Label>Max Import Rows</Label>
							<Input
								type="number"
								min={100}
								max={100000}
								step={100}
								value={settings.performance.maxImportRows}
								onChange={(e) => updatePerformance("maxImportRows", Number(e.target.value))}
							/>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Confirm Dialog */}
			<Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-amber-600" />
							Confirm Settings Change
						</DialogTitle>
						<DialogDescription>
							These changes will affect all companies on the platform. Are you sure you want to proceed?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={saveSettings.isPending}>
							{saveSettings.isPending ? "Saving..." : "Confirm & Save"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

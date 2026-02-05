import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Calendar, Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { CalendarSettings, WorkingDaySettings, PayFrequencySettings, HolidayPaySettings } from "@/types/calendar";
import { WEEKDAY_LABELS, PAY_RULE_LABELS } from "@/types/calendar";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Separator } from "@/ui/separator";
import { Skeleton } from "@/ui/skeleton";

export default function CalendarSettingsPage() {
	const queryClient = useQueryClient();
	const [hasChanges, setHasChanges] = useState(false);
	const [workingDays, setWorkingDays] = useState<WorkingDaySettings>({
		monday: true,
		tuesday: true,
		wednesday: true,
		thursday: true,
		friday: true,
		saturday: false,
		sunday: false,
		hoursPerDay: 8,
		halfDayHours: 4,
	});
	const [payFrequency, setPayFrequency] = useState<PayFrequencySettings>({
		frequency: "monthly",
		payDay: 25,
		cutoffDaysBefore: 5,
		adjustmentRule: "earlier",
	});
	const [holidayPay, setHolidayPay] = useState<HolidayPaySettings>({
		defaultPayRule: "paid",
		paidOnlyIfScheduled: false,
		overtimeMultiplier: 2,
		premiumRate: 1.5,
	});

	const { data: settings, isLoading } = useQuery({
		queryKey: ["calendar-settings"],
		queryFn: async () => {
			const response = await axios.get("/api/calendar/settings");
			return response.data.data as CalendarSettings;
		},
	});

	useEffect(() => {
		if (settings) {
			setWorkingDays(settings.workingDays);
			setPayFrequency(settings.payFrequency);
			setHolidayPay(settings.holidayPay);
		}
	}, [settings]);

	const saveSettings = useMutation({
		mutationFn: async () => {
			const response = await axios.put("/api/calendar/settings", {
				workingDays,
				payFrequency,
				holidayPay,
			});
			return response.data;
		},
		onSuccess: () => {
			toast.success("Settings saved successfully");
			queryClient.invalidateQueries({ queryKey: ["calendar-settings"] });
			setHasChanges(false);
		},
		onError: () => {
			toast.error("Failed to save settings");
		},
	});

	const toggleWorkingDay = (day: keyof WorkingDaySettings) => {
		if (typeof workingDays[day] === "boolean") {
			setWorkingDays({ ...workingDays, [day]: !workingDays[day] });
			setHasChanges(true);
		}
	};

	const workingDaysCount = Object.entries(workingDays).filter(
		([key, value]) => key !== "hoursPerDay" && key !== "halfDayHours" && value === true,
	).length;

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
						Calendar Settings
					</h1>
					<p className="text-muted-foreground">Configure working days, pay frequency, and holiday rules</p>
				</div>
				<Button onClick={() => saveSettings.mutate()} disabled={!hasChanges || saveSettings.isPending}>
					<Save className="h-4 w-4 mr-2" />
					{saveSettings.isPending ? "Saving..." : "Save Changes"}
				</Button>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				{/* Working Days */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							Working Days
						</CardTitle>
						<CardDescription>Define standard working patterns for your organization</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid grid-cols-7 gap-2">
							{Object.entries(WEEKDAY_LABELS).map(([key, label]) => {
								const isWorking = workingDays[key as keyof WorkingDaySettings] as boolean;
								return (
									<button
										key={key}
										type="button"
										onClick={() => toggleWorkingDay(key as keyof WorkingDaySettings)}
										className={`p-3 rounded-lg text-center text-sm font-medium transition-colors ${
											isWorking
												? "bg-primary text-primary-foreground"
												: "bg-muted text-muted-foreground hover:bg-muted/80"
										}`}
									>
										{label.slice(0, 3)}
									</button>
								);
							})}
						</div>
						<p className="text-sm text-muted-foreground">{workingDaysCount} working days per week</p>

						<Separator />

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="hoursPerDay">Hours per Day</Label>
								<Input
									id="hoursPerDay"
									type="number"
									min={1}
									max={24}
									value={workingDays.hoursPerDay}
									onChange={(e) => {
										setWorkingDays({ ...workingDays, hoursPerDay: Number(e.target.value) });
										setHasChanges(true);
									}}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="halfDayHours">Half-Day Hours</Label>
								<Input
									id="halfDayHours"
									type="number"
									min={1}
									max={12}
									value={workingDays.halfDayHours}
									onChange={(e) => {
										setWorkingDays({ ...workingDays, halfDayHours: Number(e.target.value) });
										setHasChanges(true);
									}}
								/>
							</div>
						</div>

						<div className="p-3 bg-muted rounded-lg text-sm">
							<p className="font-medium">Weekly Hours</p>
							<p className="text-muted-foreground">{workingDaysCount * workingDays.hoursPerDay} hours/week</p>
						</div>
					</CardContent>
				</Card>

				{/* Pay Frequency */}
				<Card>
					<CardHeader>
						<CardTitle>Pay Frequency & Dates</CardTitle>
						<CardDescription>Configure payroll cutoffs and pay dates</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-2">
							<Label>Pay Frequency</Label>
							<RadioGroup
								value={payFrequency.frequency}
								onValueChange={(v) => {
									setPayFrequency({ ...payFrequency, frequency: v as PayFrequencySettings["frequency"] });
									setHasChanges(true);
								}}
							>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="monthly" id="monthly" />
									<Label htmlFor="monthly">Monthly</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="fortnightly" id="fortnightly" />
									<Label htmlFor="fortnightly">Fortnightly</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="weekly" id="weekly" />
									<Label htmlFor="weekly">Weekly</Label>
								</div>
							</RadioGroup>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="payDay">Pay Day</Label>
								<Input
									id="payDay"
									type="number"
									min={1}
									max={31}
									value={payFrequency.payDay}
									onChange={(e) => {
										setPayFrequency({ ...payFrequency, payDay: Number(e.target.value) });
										setHasChanges(true);
									}}
								/>
								<p className="text-xs text-muted-foreground">Day of month</p>
							</div>
							<div className="space-y-2">
								<Label htmlFor="cutoff">Cutoff Days Before</Label>
								<Input
									id="cutoff"
									type="number"
									min={0}
									max={15}
									value={payFrequency.cutoffDaysBefore}
									onChange={(e) => {
										setPayFrequency({ ...payFrequency, cutoffDaysBefore: Number(e.target.value) });
										setHasChanges(true);
									}}
								/>
								<p className="text-xs text-muted-foreground">Days before pay date</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label>Holiday Adjustment</Label>
							<Select
								value={payFrequency.adjustmentRule}
								onValueChange={(v) => {
									setPayFrequency({ ...payFrequency, adjustmentRule: v as PayFrequencySettings["adjustmentRule"] });
									setHasChanges(true);
								}}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="earlier">Move Earlier if Holiday</SelectItem>
									<SelectItem value="later">Move Later if Holiday</SelectItem>
									<SelectItem value="none">No Adjustment</SelectItem>
								</SelectContent>
							</Select>
							<p className="text-xs text-muted-foreground">What happens when pay date falls on a holiday</p>
						</div>
					</CardContent>
				</Card>

				{/* Holiday Pay Rules */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Holiday Pay Rules</CardTitle>
						<CardDescription>Configure how holidays affect employee pay</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
							<div className="space-y-2">
								<Label>Default Pay Rule</Label>
								<Select
									value={holidayPay.defaultPayRule}
									onValueChange={(v) => {
										setHolidayPay({ ...holidayPay, defaultPayRule: v as HolidayPaySettings["defaultPayRule"] });
										setHasChanges(true);
									}}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Object.entries(PAY_RULE_LABELS).map(([key, label]) => (
											<SelectItem key={key} value={key}>
												{label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="overtimeMultiplier">Overtime Multiplier</Label>
								<Input
									id="overtimeMultiplier"
									type="number"
									step={0.5}
									min={1}
									max={4}
									value={holidayPay.overtimeMultiplier}
									onChange={(e) => {
										setHolidayPay({ ...holidayPay, overtimeMultiplier: Number(e.target.value) });
										setHasChanges(true);
									}}
								/>
								<p className="text-xs text-muted-foreground">e.g., 2x for double time</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="premiumRate">Premium Rate</Label>
								<Input
									id="premiumRate"
									type="number"
									step={0.25}
									min={1}
									max={3}
									value={holidayPay.premiumRate}
									onChange={(e) => {
										setHolidayPay({ ...holidayPay, premiumRate: Number(e.target.value) });
										setHasChanges(true);
									}}
								/>
								<p className="text-xs text-muted-foreground">e.g., 1.5x for time-and-a-half</p>
							</div>

							<div className="space-y-4">
								<Label>Additional Rules</Label>
								<div className="flex items-center gap-2">
									<Checkbox
										id="paidIfScheduled"
										checked={holidayPay.paidOnlyIfScheduled}
										onCheckedChange={(checked) => {
											setHolidayPay({ ...holidayPay, paidOnlyIfScheduled: !!checked });
											setHasChanges(true);
										}}
									/>
									<Label htmlFor="paidIfScheduled" className="text-sm">
										Paid only if employee normally works that day
									</Label>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

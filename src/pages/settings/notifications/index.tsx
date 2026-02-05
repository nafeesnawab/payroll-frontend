import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Bell, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const notificationSettingsSchema = z.object({
	filingReminders: z.boolean(),
	filingReminderDays: z.coerce.number().min(1).max(30),
	payrollReminders: z.boolean(),
	payrollReminderDays: z.coerce.number().min(1).max(30),
});

type NotificationSettingsFormValues = z.infer<typeof notificationSettingsSchema>;

export default function NotificationSettingsPage() {
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery({
		queryKey: ["settings", "notifications"],
		queryFn: async () => {
			const response = await axios.get("/api/settings/notifications");
			return response.data.data as NotificationSettingsFormValues;
		},
	});

	const form = useForm<NotificationSettingsFormValues>({
		resolver: zodResolver(notificationSettingsSchema),
		defaultValues: { filingReminders: true, filingReminderDays: 5, payrollReminders: true, payrollReminderDays: 3 },
	});

	useEffect(() => {
		if (data) form.reset(data);
	}, [data, form]);

	const updateMutation = useMutation({
		mutationFn: async (values: NotificationSettingsFormValues) => {
			const response = await axios.put("/api/settings/notifications", values);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings", "notifications"] });
			toast.success("Notification settings saved");
		},
	});

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div>
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<Bell className="h-6 w-6" />
					Notifications
				</h1>
				<p className="text-muted-foreground">Configure reminders and alerts</p>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Filing Reminders</CardTitle>
							<CardDescription>Get notified about upcoming statutory filings</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="filingReminders"
								render={({ field }) => (
									<FormItem className="flex items-center justify-between rounded-lg border p-3">
										<div>
											<FormLabel>Enable Filing Reminders</FormLabel>
											<FormDescription>Receive alerts for EMP201, UIF deadlines</FormDescription>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="filingReminderDays"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Days Before Deadline</FormLabel>
										<FormControl>
											<Input type="number" className="w-24" {...field} />
										</FormControl>
										<FormDescription>How many days before deadline to send reminder</FormDescription>
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Payroll Reminders</CardTitle>
							<CardDescription>Get notified about payroll processing</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="payrollReminders"
								render={({ field }) => (
									<FormItem className="flex items-center justify-between rounded-lg border p-3">
										<div>
											<FormLabel>Enable Payroll Reminders</FormLabel>
											<FormDescription>Receive alerts for upcoming payroll runs</FormDescription>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="payrollReminderDays"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Days Before Payroll</FormLabel>
										<FormControl>
											<Input type="number" className="w-24" {...field} />
										</FormControl>
										<FormDescription>How many days before payroll to send reminder</FormDescription>
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<div className="flex justify-end">
						<Button type="submit" disabled={updateMutation.isPending}>
							{updateMutation.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : (
								<CheckCircle2 className="h-4 w-4 mr-2" />
							)}
							Save Changes
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

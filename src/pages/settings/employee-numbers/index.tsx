import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CheckCircle2, Hash, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const employeeNumberingSchema = z.object({
	autoGenerate: z.boolean(),
	prefix: z.string(),
	startingNumber: z.coerce.number().min(1),
	allowManualOverride: z.boolean(),
});

type EmployeeNumberingFormValues = z.infer<typeof employeeNumberingSchema>;

export default function EmployeeNumbersPage() {
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery({
		queryKey: ["settings", "employee-numbers"],
		queryFn: async () => {
			const response = await axios.get("/api/settings/employee-numbers");
			return response.data.data as EmployeeNumberingFormValues;
		},
	});

	const form = useForm<EmployeeNumberingFormValues>({
		resolver: zodResolver(employeeNumberingSchema),
		defaultValues: { autoGenerate: true, prefix: "EMP", startingNumber: 1001, allowManualOverride: true },
	});

	useEffect(() => {
		if (data) form.reset(data);
	}, [data, form]);

	const updateMutation = useMutation({
		mutationFn: async (values: EmployeeNumberingFormValues) => {
			const response = await axios.put("/api/settings/employee-numbers", values);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings", "employee-numbers"] });
			toast.success("Employee numbering saved");
		},
	});

	const prefix = form.watch("prefix");
	const startingNumber = form.watch("startingNumber");

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
					<Hash className="h-6 w-6" />
					Employee Numbering
				</h1>
				<p className="text-muted-foreground">Configure employee ID format</p>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Auto-generation Settings</CardTitle>
							<CardDescription>Define how employee numbers are created</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField control={form.control} name="autoGenerate" render={({ field }) => (
								<FormItem className="flex items-center justify-between rounded-lg border p-3">
									<div>
										<FormLabel>Auto-generate Employee Numbers</FormLabel>
										<FormDescription>Automatically assign numbers to new employees</FormDescription>
									</div>
									<FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
								</FormItem>
							)} />
							<div className="grid gap-4 md:grid-cols-2">
								<FormField control={form.control} name="prefix" render={({ field }) => (
									<FormItem>
										<FormLabel>Prefix</FormLabel>
										<FormControl><Input {...field} /></FormControl>
										<FormDescription>Text before the number</FormDescription>
									</FormItem>
								)} />
								<FormField control={form.control} name="startingNumber" render={({ field }) => (
									<FormItem>
										<FormLabel>Starting Number</FormLabel>
										<FormControl><Input type="number" {...field} /></FormControl>
										<FormDescription>First number to use</FormDescription>
									</FormItem>
								)} />
							</div>
							<div className="p-4 bg-muted rounded-lg">
								<p className="text-sm text-muted-foreground">Preview: <span className="font-mono font-bold">{prefix}{startingNumber}</span></p>
							</div>
							<FormField control={form.control} name="allowManualOverride" render={({ field }) => (
								<FormItem className="flex items-center justify-between rounded-lg border p-3">
									<div>
										<FormLabel>Allow Manual Override</FormLabel>
										<FormDescription>Let admins set custom employee numbers</FormDescription>
									</div>
									<FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
								</FormItem>
							)} />
						</CardContent>
					</Card>

					<div className="flex justify-end">
						<Button type="submit" disabled={updateMutation.isPending}>
							{updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
							Save Changes
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

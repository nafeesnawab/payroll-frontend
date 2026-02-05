import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Calendar, CheckCircle2, Clock, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const frequencySchema = z.object({
	name: z.string().min(1, "Name is required"),
	type: z.enum(["monthly", "weekly", "fortnightly", "custom"]),
	startDate: z.string().min(1, "Start date is required"),
	cutOffDay: z.coerce.number().min(1).max(31),
	payDay: z.coerce.number().min(1).max(31),
});

type FrequencyFormValues = z.infer<typeof frequencySchema>;

interface PayFrequency {
	id: string;
	name: string;
	type: string;
	startDate: string;
	cutOffDay: number;
	payDay: number;
	isActive: boolean;
}

export default function PayFrequenciesPage() {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const { data: frequencies, isLoading } = useQuery({
		queryKey: ["settings", "pay-frequencies"],
		queryFn: async () => {
			const response = await axios.get("/api/settings/pay-frequencies");
			return response.data.data as PayFrequency[];
		},
	});

	const form = useForm<FrequencyFormValues>({
		resolver: zodResolver(frequencySchema),
		defaultValues: {
			name: "",
			type: "monthly",
			startDate: new Date().toISOString().split("T")[0],
			cutOffDay: 25,
			payDay: 28,
		},
	});

	const createMutation = useMutation({
		mutationFn: async (data: FrequencyFormValues) => {
			const response = await axios.post("/api/settings/pay-frequencies", { ...data, isActive: true });
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings", "pay-frequencies"] });
			toast.success("Pay frequency added");
			setOpen(false);
			form.reset();
		},
	});

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-32 w-full" />
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Clock className="h-6 w-6" />
						Pay Frequencies
					</h1>
					<p className="text-muted-foreground">Define how often employees are paid</p>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Add Frequency
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Pay Frequency</DialogTitle>
						</DialogHeader>
						<Form {...form}>
							<form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name *</FormLabel>
											<FormControl>
												<Input placeholder="e.g., Monthly Staff" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="type"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Type *</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="monthly">Monthly</SelectItem>
													<SelectItem value="weekly">Weekly</SelectItem>
													<SelectItem value="fortnightly">Fortnightly</SelectItem>
													<SelectItem value="custom">Custom</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="startDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Start Date *</FormLabel>
											<FormControl>
												<Input type="date" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="cutOffDay"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Cut-off Day *</FormLabel>
												<FormControl>
													<Input type="number" min={1} max={31} {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="payDay"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Pay Day *</FormLabel>
												<FormControl>
													<Input type="number" min={1} max={31} {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="flex justify-end gap-2 pt-4">
									<Button type="button" variant="outline" onClick={() => setOpen(false)}>
										Cancel
									</Button>
									<Button type="submit" disabled={createMutation.isPending}>
										{createMutation.isPending ? (
											<Loader2 className="h-4 w-4 animate-spin mr-2" />
										) : (
											<CheckCircle2 className="h-4 w-4 mr-2" />
										)}
										Add
									</Button>
								</div>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{frequencies?.map((freq) => (
					<Card key={freq.id}>
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg">{freq.name}</CardTitle>
								<Badge variant={freq.isActive ? "default" : "secondary"}>{freq.type}</Badge>
							</div>
							<CardDescription>Started {new Date(freq.startDate).toLocaleDateString("en-ZA")}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<span>Cut-off: Day {freq.cutOffDay}</span>
								</div>
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<span>Pay: Day {freq.payDay}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

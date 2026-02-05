import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";
import type { CreateTerminationInput } from "@/types/termination";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Loader2, UserMinus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
	employeeId: z.string().min(1, "Select an employee"),
	terminationDate: z.string().min(1, "Required"),
	lastWorkingDay: z.string().min(1, "Required"),
	reason: z.enum(["resignation", "dismissal", "retrenchment", "contract_end", "death"]),
	paidInLieu: z.boolean(),
});

export default function NewTerminationPage() {
	const navigate = useNavigate();

	const form = useForm<CreateTerminationInput>({
		resolver: zodResolver(schema),
		defaultValues: {
			employeeId: "",
			terminationDate: "",
			lastWorkingDay: "",
			reason: "resignation",
			paidInLieu: false,
		},
	});

	const { data: employees } = useQuery({
		queryKey: ["active-employees"],
		queryFn: async () => {
			const response = await axios.get("/api/employees/active");
			return response.data.data as { id: string; name: string; employeeNumber: string }[];
		},
	});

	const createMutation = useMutation({
		mutationFn: async (data: CreateTerminationInput) => {
			const response = await axios.post("/api/terminations", data);
			return response.data.data;
		},
		onSuccess: (data) => {
			toast.success("Termination started");
			navigate(`/terminations/${data.id}`);
		},
	});

	return (
		<div className="p-6 max-w-2xl mx-auto">
			<div className="mb-6">
				<Button variant="ghost" onClick={() => navigate("/terminations")}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UserMinus className="h-5 w-5" />
						Start Termination
					</CardTitle>
					<CardDescription>Step 1: Initiate employee termination</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-6">
							<FormField
								control={form.control}
								name="employeeId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Employee *</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select employee" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{employees?.map((emp) => (
													<SelectItem key={emp.id} value={emp.id}>
														{emp.name} ({emp.employeeNumber})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="terminationDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Termination Date *</FormLabel>
											<FormControl>
												<Input type="date" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="lastWorkingDay"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Last Working Day *</FormLabel>
											<FormControl>
												<Input type="date" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="reason"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Reason *</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="resignation">Resignation</SelectItem>
												<SelectItem value="dismissal">Dismissal</SelectItem>
												<SelectItem value="retrenchment">Retrenchment</SelectItem>
												<SelectItem value="contract_end">Contract End</SelectItem>
												<SelectItem value="death">Death</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="paidInLieu"
								render={({ field }) => (
									<FormItem className="flex items-center gap-3 rounded-lg border p-4">
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
										<div className="flex-1">
											<FormLabel className="!mt-0">Pay Notice in Lieu</FormLabel>
											<FormDescription>Pay the notice period instead of requiring it to be worked</FormDescription>
										</div>
									</FormItem>
								)}
							/>

							<div className="flex justify-end gap-3">
								<Button type="button" variant="outline" onClick={() => navigate("/terminations")}>
									Cancel
								</Button>
								<Button type="submit" disabled={createMutation.isPending}>
									{createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
									Continue
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}

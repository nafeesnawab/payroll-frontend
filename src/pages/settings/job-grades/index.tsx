import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CheckCircle2, Loader2, Plus, Sliders } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const jobGradeSchema = z.object({
	name: z.string().min(1, "Name is required"),
	code: z.string().min(1, "Code is required"),
	minimumWage: z.coerce.number().optional(),
});

type JobGradeFormValues = z.infer<typeof jobGradeSchema>;

interface JobGrade {
	id: string;
	name: string;
	code: string;
	minimumWage?: number;
}

const formatCurrency = (amount?: number) => {
	if (!amount) return "—";
	return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 0 }).format(amount);
};

export default function JobGradesPage() {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const { data: jobGrades, isLoading } = useQuery({
		queryKey: ["settings", "job-grades"],
		queryFn: async () => {
			const response = await axios.get("/api/settings/job-grades");
			return response.data.data as JobGrade[];
		},
	});

	const form = useForm<JobGradeFormValues>({
		resolver: zodResolver(jobGradeSchema),
		defaultValues: { name: "", code: "", minimumWage: undefined },
	});

	const createMutation = useMutation({
		mutationFn: async (data: JobGradeFormValues) => {
			const response = await axios.post("/api/settings/job-grades", data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings", "job-grades"] });
			toast.success("Job grade added");
			setOpen(false);
			form.reset();
		},
	});

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<div className="grid gap-4 md:grid-cols-3">
					{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Sliders className="h-6 w-6" />
						Job Grades
					</h1>
					<p className="text-muted-foreground">Define job levels and minimum wages</p>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button><Plus className="h-4 w-4 mr-2" />Add Job Grade</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Job Grade</DialogTitle>
						</DialogHeader>
						<Form {...form}>
							<form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
								<FormField control={form.control} name="name" render={({ field }) => (
									<FormItem>
										<FormLabel>Name *</FormLabel>
										<FormControl><Input placeholder="e.g., Senior" {...field} /></FormControl>
										<FormMessage />
									</FormItem>
								)} />
								<FormField control={form.control} name="code" render={({ field }) => (
									<FormItem>
										<FormLabel>Code *</FormLabel>
										<FormControl><Input placeholder="e.g., SNR" {...field} /></FormControl>
										<FormMessage />
									</FormItem>
								)} />
								<FormField control={form.control} name="minimumWage" render={({ field }) => (
									<FormItem>
										<FormLabel>Minimum Wage (ZAR)</FormLabel>
										<FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
										<FormMessage />
									</FormItem>
								)} />
								<div className="flex justify-end gap-2 pt-4">
									<Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
									<Button type="submit" disabled={createMutation.isPending}>
										{createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
										Add
									</Button>
								</div>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				{jobGrades?.map((grade) => (
					<Card key={grade.id}>
						<CardContent className="pt-6">
							<h3 className="font-semibold">{grade.name}</h3>
							<p className="text-sm text-muted-foreground">Code: {grade.code}</p>
							<p className="text-lg font-bold mt-2">{formatCurrency(grade.minimumWage)}</p>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

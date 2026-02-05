import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";
import { Textarea } from "@/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CheckCircle2, Hash, Loader2, MapPin, Plus, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const payPointSchema = z.object({
	name: z.string().min(1, "Name is required"),
	code: z.string().min(1, "Code is required").max(10),
	description: z.string().optional(),
});

type PayPointFormValues = z.infer<typeof payPointSchema>;

interface PayPoint {
	id: string;
	name: string;
	code: string;
	description?: string;
	employeeCount: number;
}

export default function PayPointsPage() {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const { data: payPoints, isLoading } = useQuery({
		queryKey: ["settings", "pay-points"],
		queryFn: async () => {
			const response = await axios.get("/api/settings/pay-points");
			return response.data.data as PayPoint[];
		},
	});

	const form = useForm<PayPointFormValues>({
		resolver: zodResolver(payPointSchema),
		defaultValues: { name: "", code: "", description: "" },
	});

	const createMutation = useMutation({
		mutationFn: async (data: PayPointFormValues) => {
			const response = await axios.post("/api/settings/pay-points", data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings", "pay-points"] });
			toast.success("Pay point added");
			setOpen(false);
			form.reset();
		},
	});

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<div className="grid gap-4 md:grid-cols-3">
					{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<MapPin className="h-6 w-6" />
						Pay Points
					</h1>
					<p className="text-muted-foreground">Group employees by department or location</p>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button><Plus className="h-4 w-4 mr-2" />Add Pay Point</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Pay Point</DialogTitle>
						</DialogHeader>
						<Form {...form}>
							<form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
								<FormField control={form.control} name="name" render={({ field }) => (
									<FormItem>
										<FormLabel>Name *</FormLabel>
										<FormControl><Input placeholder="e.g., Head Office" {...field} /></FormControl>
										<FormMessage />
									</FormItem>
								)} />
								<FormField control={form.control} name="code" render={({ field }) => (
									<FormItem>
										<FormLabel>Code *</FormLabel>
										<FormControl><Input placeholder="e.g., HO" maxLength={10} {...field} /></FormControl>
										<FormMessage />
									</FormItem>
								)} />
								<FormField control={form.control} name="description" render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl><Textarea {...field} /></FormControl>
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
				{payPoints?.map((pp) => (
					<Card key={pp.id} className="hover:shadow-md transition-shadow">
						<CardContent className="pt-6">
							<div className="flex items-start justify-between">
								<div>
									<h3 className="font-semibold">{pp.name}</h3>
									<Badge variant="outline" className="mt-1"><Hash className="h-3 w-3 mr-1" />{pp.code}</Badge>
								</div>
								<div className="flex items-center gap-1 text-muted-foreground">
									<Users className="h-4 w-4" />
									<span className="text-sm">{pp.employeeCount}</span>
								</div>
							</div>
							{pp.description && <p className="text-sm text-muted-foreground mt-3">{pp.description}</p>}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

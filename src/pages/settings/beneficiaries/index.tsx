import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Building2, CheckCircle2, Link2, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const beneficiarySchema = z.object({
	name: z.string().min(1, "Name is required"),
	bankName: z.string().min(1, "Bank is required"),
	accountNumber: z.string().min(5, "Account number is required"),
	branchCode: z.string().min(6, "Branch code is required"),
	reference: z.string().min(1, "Reference is required"),
});

type BeneficiaryFormValues = z.infer<typeof beneficiarySchema>;

interface Beneficiary {
	id: string;
	name: string;
	bankName: string;
	accountNumber: string;
	branchCode: string;
	reference: string;
	linkedPayrollItemIds: string[];
}

export default function BeneficiariesPage() {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const { data: beneficiaries, isLoading } = useQuery({
		queryKey: ["settings", "beneficiaries"],
		queryFn: async () => {
			const response = await axios.get("/api/settings/beneficiaries");
			return response.data.data as Beneficiary[];
		},
	});

	const form = useForm<BeneficiaryFormValues>({
		resolver: zodResolver(beneficiarySchema),
		defaultValues: { name: "", bankName: "", accountNumber: "", branchCode: "", reference: "" },
	});

	const createMutation = useMutation({
		mutationFn: async (data: BeneficiaryFormValues) => {
			const response = await axios.post("/api/settings/beneficiaries", { ...data, linkedPayrollItemIds: [] });
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings", "beneficiaries"] });
			toast.success("Beneficiary added");
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
						<Link2 className="h-6 w-6" />
						Beneficiaries
					</h1>
					<p className="text-muted-foreground">Configure third-party payment recipients</p>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Add Beneficiary
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Beneficiary</DialogTitle>
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
												<Input placeholder="e.g., Old Mutual Pension" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="bankName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Bank *</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="accountNumber"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Account Number *</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="branchCode"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Branch Code *</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<FormField
									control={form.control}
									name="reference"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Payment Reference *</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
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

			<div className="grid gap-4">
				{beneficiaries?.map((ben) => (
					<Card key={ben.id}>
						<CardHeader className="pb-2">
							<CardTitle className="text-lg flex items-center gap-2">
								<Building2 className="h-4 w-4" />
								{ben.name}
							</CardTitle>
							<CardDescription>{ben.bankName}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-3 gap-4 text-sm">
								<div>
									<p className="text-muted-foreground">Account</p>
									<p className="font-medium">****{ben.accountNumber.slice(-4)}</p>
								</div>
								<div>
									<p className="text-muted-foreground">Branch</p>
									<p className="font-medium">{ben.branchCode}</p>
								</div>
								<div>
									<p className="text-muted-foreground">Reference</p>
									<p className="font-medium">{ben.reference}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
				{beneficiaries?.length === 0 && (
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center justify-center py-12">
							<Link2 className="h-12 w-12 text-muted-foreground mb-4" />
							<p className="text-muted-foreground">No beneficiaries configured</p>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}

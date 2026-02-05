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
import { Banknote, CheckCircle2, Loader2, Plus, Star } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const SA_BANKS = [
	{ name: "ABSA Bank", code: "632005" },
	{ name: "Capitec Bank", code: "470010" },
	{ name: "First National Bank", code: "250655" },
	{ name: "Investec Bank", code: "580105" },
	{ name: "Nedbank", code: "198765" },
	{ name: "Standard Bank", code: "051001" },
	{ name: "African Bank", code: "430000" },
	{ name: "Bidvest Bank", code: "462005" },
	{ name: "TymeBank", code: "678910" },
];

const bankSchema = z.object({
	bankName: z.string().min(1, "Bank is required"),
	accountHolderName: z.string().min(1, "Account holder name is required"),
	accountNumber: z.string().min(5, "Account number is required"),
	branchCode: z.string().min(6, "Branch code is required"),
	accountType: z.enum(["current", "savings", "transmission"]),
	eftFormat: z.string().min(1, "EFT format is required"),
	isPrimary: z.boolean(),
});

type BankFormValues = z.infer<typeof bankSchema>;

interface BankAccount {
	id: string;
	bankName: string;
	accountHolderName: string;
	accountNumber: string;
	branchCode: string;
	accountType: string;
	eftFormat: string;
	isPrimary: boolean;
}

export default function BankingSettingsPage() {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const { data: accounts, isLoading } = useQuery({
		queryKey: ["settings", "banking"],
		queryFn: async () => {
			const response = await axios.get("/api/settings/banking");
			return response.data.data as BankAccount[];
		},
	});

	const form = useForm<BankFormValues>({
		resolver: zodResolver(bankSchema),
		defaultValues: {
			bankName: "",
			accountHolderName: "",
			accountNumber: "",
			branchCode: "",
			accountType: "current",
			eftFormat: "standard",
			isPrimary: false,
		},
	});

	const createMutation = useMutation({
		mutationFn: async (data: BankFormValues) => {
			const response = await axios.post("/api/settings/banking", data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings", "banking"] });
			toast.success("Bank account added successfully");
			setOpen(false);
			form.reset();
		},
		onError: () => {
			toast.error("Failed to add bank account");
		},
	});

	const handleBankChange = (bankName: string) => {
		const bank = SA_BANKS.find((b) => b.name === bankName);
		if (bank) {
			form.setValue("bankName", bank.name);
			form.setValue("branchCode", bank.code);
		}
	};

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Banknote className="h-6 w-6" />
						Banking & EFT Setup
					</h1>
					<p className="text-muted-foreground">Configure employer bank accounts for salary payments</p>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Add Bank Account
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Bank Account</DialogTitle>
						</DialogHeader>
						<Form {...form}>
							<form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
								<FormField
									control={form.control}
									name="bankName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Bank *</FormLabel>
											<Select onValueChange={handleBankChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select bank" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{SA_BANKS.map((bank) => (
														<SelectItem key={bank.code} value={bank.name}>
															{bank.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="accountHolderName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Account Holder Name *</FormLabel>
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
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="accountType"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Account Type *</FormLabel>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="current">Current</SelectItem>
														<SelectItem value="savings">Savings</SelectItem>
														<SelectItem value="transmission">Transmission</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="eftFormat"
										render={({ field }) => (
											<FormItem>
												<FormLabel>EFT Format *</FormLabel>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="standard">Standard</SelectItem>
														<SelectItem value="csv">CSV Export</SelectItem>
													</SelectContent>
												</Select>
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
										Add Account
									</Button>
								</div>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-4">
				{accounts?.map((account) => (
					<Card key={account.id}>
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg flex items-center gap-2">
									{account.bankName}
									{account.isPrimary && (
										<Star className="h-4 w-4 text-amber-500 fill-amber-500" />
									)}
								</CardTitle>
							</div>
							<CardDescription>
								{account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} Account
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-3 gap-4 text-sm">
								<div>
									<p className="text-muted-foreground">Account Holder</p>
									<p className="font-medium">{account.accountHolderName}</p>
								</div>
								<div>
									<p className="text-muted-foreground">Account Number</p>
									<p className="font-medium">****{account.accountNumber.slice(-4)}</p>
								</div>
								<div>
									<p className="text-muted-foreground">Branch Code</p>
									<p className="font-medium">{account.branchCode}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				))}

				{accounts?.length === 0 && (
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center justify-center py-12">
							<Banknote className="h-12 w-12 text-muted-foreground mb-4" />
							<p className="text-muted-foreground">No bank accounts configured</p>
							<Button variant="outline" className="mt-4" onClick={() => setOpen(true)}>
								<Plus className="h-4 w-4 mr-2" />
								Add Bank Account
							</Button>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}

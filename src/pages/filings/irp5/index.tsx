import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import type { IRP5Certificate } from "@/types/filing";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Download, FileCheck, Loader2, RefreshCw, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
	draft: { label: "Draft", variant: "secondary" },
	generated: { label: "Generated", variant: "outline" },
	issued: { label: "Issued", variant: "default" },
};

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);
}

export default function IRP5CertificatesPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [taxYear, setTaxYear] = useState("2025");
	const [statusFilter, setStatusFilter] = useState("all");
	const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

	const { data: certificates, isLoading } = useQuery({
		queryKey: ["irp5-certificates", { taxYear, status: statusFilter }],
		queryFn: async () => {
			const params = new URLSearchParams();
			params.set("taxYear", taxYear);
			if (statusFilter !== "all") params.set("status", statusFilter);
			const response = await axios.get(`/api/filings/irp5?${params.toString()}`);
			return response.data.data as IRP5Certificate[];
		},
	});

	const generateMutation = useMutation({
		mutationFn: async () => axios.post("/api/filings/irp5/generate"),
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: ["irp5-certificates"] });
			setGenerateDialogOpen(false);
			toast.success(`${response.data.generated} certificates generated`);
		},
	});

	const filteredCertificates = certificates?.filter(
		(c) => c.employeeName.toLowerCase().includes(search.toLowerCase()) || c.employeeNumber.includes(search),
	);

	const draftCount = certificates?.filter((c) => c.status === "draft").length || 0;
	const generatedCount = certificates?.filter((c) => c.status === "generated").length || 0;
	const issuedCount = certificates?.filter((c) => c.status === "issued").length || 0;

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => navigate("/filings")}>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold flex items-center gap-2">
							<FileCheck className="h-6 w-6" />
							IRP5 / IT3(a) Certificates
						</h1>
						<p className="text-muted-foreground">Employee tax certificates for SARS</p>
					</div>
				</div>
				<Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
					<DialogTrigger asChild>
						<Button disabled={draftCount === 0}>
							<RefreshCw className="h-4 w-4 mr-2" />
							Generate All ({draftCount})
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Generate Certificates</DialogTitle>
							<DialogDescription>
								Generate IRP5/IT3(a) certificates for all {draftCount} employees in draft status. This requires EMP501
								reconciliation to be complete.
							</DialogDescription>
						</DialogHeader>
						<div className="flex justify-end gap-2 mt-4">
							<Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
								Cancel
							</Button>
							<Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
								{generateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
								Generate
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Draft</CardDescription>
						<CardTitle className="text-3xl">{draftCount}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">Awaiting generation</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Generated</CardDescription>
						<CardTitle className="text-3xl">{generatedCount}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">Ready to issue</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Issued</CardDescription>
						<CardTitle className="text-3xl">{issuedCount}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">Distributed to employees</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-wrap gap-4 mb-6">
						<div className="relative flex-1 min-w-[200px] max-w-sm">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search employee..."
								className="pl-9"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
						<Select value={taxYear} onValueChange={setTaxYear}>
							<SelectTrigger className="w-32">
								<SelectValue placeholder="Tax Year" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="2025">2025</SelectItem>
								<SelectItem value="2024">2024</SelectItem>
								<SelectItem value="2023">2023</SelectItem>
							</SelectContent>
						</Select>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="draft">Draft</SelectItem>
								<SelectItem value="generated">Generated</SelectItem>
								<SelectItem value="issued">Issued</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{isLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-16 w-full" />
							))}
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Employee</TableHead>
									<TableHead>Tax Number</TableHead>
									<TableHead>Type</TableHead>
									<TableHead className="text-right">Gross Income</TableHead>
									<TableHead className="text-right">Total PAYE</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredCertificates?.map((cert) => {
									const status = statusConfig[cert.status];
									return (
										<TableRow key={cert.id}>
											<TableCell>
												<div>
													<p className="font-medium">{cert.employeeName}</p>
													<p className="text-sm text-muted-foreground">{cert.employeeNumber}</p>
												</div>
											</TableCell>
											<TableCell className="font-mono">{cert.taxNumber}</TableCell>
											<TableCell>
												<Badge variant="outline">{cert.certificateType}</Badge>
											</TableCell>
											<TableCell className="text-right font-mono">{formatCurrency(cert.grossIncome)}</TableCell>
											<TableCell className="text-right font-mono">{formatCurrency(cert.totalPaye)}</TableCell>
											<TableCell>
												<Badge variant={status.variant}>{status.label}</Badge>
											</TableCell>
											<TableCell className="text-right">
												{cert.status !== "draft" && (
													<Button size="sm" variant="ghost">
														<Download className="h-4 w-4" />
													</Button>
												)}
											</TableCell>
										</TableRow>
									);
								})}
								{filteredCertificates?.length === 0 && (
									<TableRow>
										<TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
											No certificates found
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, RotateCcw, Settings } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import type { CompanyOverride, GroupCompany } from "@/types/group";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export default function CompanyOverridesPage() {
	const navigate = useNavigate();
	const { id } = useParams();
	const queryClient = useQueryClient();

	const { data: company, isLoading: loadingCompany } = useQuery({
		queryKey: ["group-company", id],
		queryFn: async () => {
			const response = await axios.get(`/api/group/companies/${id}`);
			return response.data.data as GroupCompany;
		},
	});

	const { data: overrides, isLoading: loadingOverrides } = useQuery({
		queryKey: ["company-overrides", id],
		queryFn: async () => {
			const response = await axios.get(`/api/group/companies/${id}/overrides`);
			return response.data.data as CompanyOverride[];
		},
	});

	const resetOverride = useMutation({
		mutationFn: async (settingId: string) => {
			const response = await axios.delete(`/api/group/companies/${id}/overrides/${settingId}`);
			return response.data;
		},
		onSuccess: () => {
			toast.success("Override reset to group default");
			queryClient.invalidateQueries({ queryKey: ["company-overrides", id] });
		},
		onError: () => {
			toast.error("Failed to reset override");
		},
	});

	if (loadingCompany || loadingOverrides) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-96" />
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => navigate("/group/companies")}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Settings className="h-6 w-6" />
						Company Overrides
					</h1>
					<p className="text-muted-foreground">
						{company?.tradingName} - Settings that differ from group defaults
					</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Active Overrides</CardTitle>
					<CardDescription>
						These settings have been customized for this company
					</CardDescription>
				</CardHeader>
				<CardContent>
					{overrides && overrides.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Setting</TableHead>
									<TableHead>Group Value</TableHead>
									<TableHead>Company Value</TableHead>
									<TableHead>Overridden</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{overrides.map((override) => (
									<TableRow key={override.settingId}>
										<TableCell className="font-medium">{override.settingName}</TableCell>
										<TableCell>
											<code className="text-sm bg-muted px-2 py-1 rounded">
												{String(override.inheritedValue)}
											</code>
										</TableCell>
										<TableCell>
											<Badge className="bg-amber-100 text-amber-800">
												{String(override.overriddenValue)}
											</Badge>
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											<div>
												<p>{new Date(override.overriddenAt).toLocaleDateString()}</p>
												<p className="text-xs">by {override.overriddenBy}</p>
											</div>
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => resetOverride.mutate(override.settingId)}
											>
												<RotateCcw className="h-4 w-4 mr-1" />
												Reset
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-muted-foreground text-center py-8">
							No overrides - this company uses all group defaults
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

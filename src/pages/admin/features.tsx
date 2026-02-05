import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Flag, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { FeatureFlag, FeatureScope, FeatureStatus } from "@/types/admin";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Slider } from "@/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export default function FeatureFlagsPage() {
	const queryClient = useQueryClient();
	const [features, setFeatures] = useState<FeatureFlag[]>([]);
	const [hasChanges, setHasChanges] = useState(false);

	const { data, isLoading } = useQuery({
		queryKey: ["admin-features"],
		queryFn: async () => {
			const response = await axios.get("/api/admin/features");
			return response.data.data as FeatureFlag[];
		},
	});

	useEffect(() => {
		if (data) {
			setFeatures(data);
		}
	}, [data]);

	const saveFeatures = useMutation({
		mutationFn: async (updatedFeatures: FeatureFlag[]) => {
			const response = await axios.put("/api/admin/features", { features: updatedFeatures });
			return response.data;
		},
		onSuccess: () => {
			toast.success("Feature flags saved");
			queryClient.invalidateQueries({ queryKey: ["admin-features"] });
			setHasChanges(false);
		},
		onError: () => {
			toast.error("Failed to save features");
		},
	});

	const updateFeature = (id: string, updates: Partial<FeatureFlag>) => {
		setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
		setHasChanges(true);
	};

	const getStatusBadge = (status: FeatureStatus) => {
		switch (status) {
			case "on":
				return <Badge className="bg-green-100 text-green-800">On</Badge>;
			case "beta":
				return <Badge className="bg-amber-100 text-amber-800">Beta</Badge>;
			case "off":
				return <Badge variant="secondary">Off</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-96" />
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Flag className="h-6 w-6" />
						Feature Flags
					</h1>
					<p className="text-muted-foreground">Control feature availability and rollout</p>
				</div>
				<Button onClick={() => saveFeatures.mutate(features)} disabled={!hasChanges || saveFeatures.isPending}>
					<Save className="h-4 w-4 mr-2" />
					{saveFeatures.isPending ? "Saving..." : "Save Changes"}
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Features</CardTitle>
					<CardDescription>Toggle features and control rollout percentages</CardDescription>
				</CardHeader>
				<CardContent>
					{features.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Feature</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Scope</TableHead>
									<TableHead className="w-48">Rollout %</TableHead>
									<TableHead>Last Updated</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{features.map((feature) => (
									<TableRow key={feature.id}>
										<TableCell>
											<div>
												<p className="font-medium">{feature.name}</p>
												<p className="text-xs text-muted-foreground">{feature.description}</p>
											</div>
										</TableCell>
										<TableCell>
											<Select
												value={feature.status}
												onValueChange={(v) => updateFeature(feature.id, { status: v as FeatureStatus })}
											>
												<SelectTrigger className="w-24">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="off">Off</SelectItem>
													<SelectItem value="beta">Beta</SelectItem>
													<SelectItem value="on">On</SelectItem>
												</SelectContent>
											</Select>
										</TableCell>
										<TableCell>
											<Select
												value={feature.scope}
												onValueChange={(v) => updateFeature(feature.id, { scope: v as FeatureScope })}
											>
												<SelectTrigger className="w-28">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="global">Global</SelectItem>
													<SelectItem value="group">Group</SelectItem>
													<SelectItem value="company">Company</SelectItem>
												</SelectContent>
											</Select>
										</TableCell>
										<TableCell>
											{feature.status === "beta" ? (
												<div className="space-y-2">
													<Slider
														value={[feature.rolloutPercentage]}
														onValueChange={([value]) => updateFeature(feature.id, { rolloutPercentage: value })}
														max={100}
														step={5}
													/>
													<p className="text-xs text-muted-foreground text-center">{feature.rolloutPercentage}%</p>
												</div>
											) : (
												<span className="text-muted-foreground">{feature.status === "on" ? "100%" : "0%"}</span>
											)}
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											<div>
												<p>{new Date(feature.updatedAt).toLocaleDateString()}</p>
												<p className="text-xs">by {feature.updatedBy}</p>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-muted-foreground text-center py-8">No feature flags</p>
					)}
				</CardContent>
			</Card>

			{/* Legend */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Status Guide</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="flex items-start gap-3">
							{getStatusBadge("off")}
							<div>
								<p className="font-medium">Off</p>
								<p className="text-sm text-muted-foreground">Feature is disabled for all users</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							{getStatusBadge("beta")}
							<div>
								<p className="font-medium">Beta</p>
								<p className="text-sm text-muted-foreground">Gradual rollout based on percentage</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							{getStatusBadge("on")}
							<div>
								<p className="font-medium">On</p>
								<p className="text-sm text-muted-foreground">Feature is enabled for all users</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

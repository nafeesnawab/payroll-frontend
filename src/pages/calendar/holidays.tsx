import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { CreateCompanyHolidayInput, PublicHoliday } from "@/types/calendar";
import { PAY_RULE_LABELS } from "@/types/calendar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export default function HolidaysPage() {
	const queryClient = useQueryClient();
	const [year, setYear] = useState(new Date().getFullYear());
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [newHoliday, setNewHoliday] = useState<{
		name: string;
		date: string;
		isPaid: boolean;
		scope: "all" | "pay_point";
	}>({
		name: "",
		date: "",
		isPaid: true,
		scope: "all",
	});

	const { data: holidays, isLoading } = useQuery({
		queryKey: ["holidays", year],
		queryFn: async () => {
			const response = await axios.get(`/api/calendar/holidays?year=${year}`);
			return response.data.data as PublicHoliday[];
		},
	});

	const updateHoliday = useMutation({
		mutationFn: async ({ id, isPaid }: { id: string; isPaid: boolean }) => {
			const response = await axios.put(`/api/calendar/holidays/${id}`, { isPaid });
			return response.data;
		},
		onSuccess: () => {
			toast.success("Holiday updated");
			queryClient.invalidateQueries({ queryKey: ["holidays", year] });
		},
		onError: () => {
			toast.error("Failed to update holiday");
		},
	});

	const addCompanyHoliday = useMutation({
		mutationFn: async (data: CreateCompanyHolidayInput) => {
			const response = await axios.post("/api/calendar/holidays/company", data);
			return response.data;
		},
		onSuccess: () => {
			toast.success("Company holiday added");
			queryClient.invalidateQueries({ queryKey: ["holidays", year] });
			setAddDialogOpen(false);
			setNewHoliday({ name: "", date: "", isPaid: true, scope: "all" });
		},
		onError: () => {
			toast.error("Failed to add holiday");
		},
	});

	const handleAddHoliday = () => {
		if (!newHoliday.name || !newHoliday.date) {
			toast.error("Please fill in all required fields");
			return;
		}
		addCompanyHoliday.mutate(newHoliday);
	};

	const getStatusBadge = (holiday: PublicHoliday) => {
		if (holiday.status === "custom") {
			return <Badge variant="secondary">Company</Badge>;
		}
		if (holiday.status === "overridden") {
			return <Badge variant="outline">Overridden</Badge>;
		}
		return <Badge>Default</Badge>;
	};

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-96" />
			</div>
		);
	}

	const publicHolidays = holidays?.filter((h) => h.type === "public") || [];
	const companyHolidays = holidays?.filter((h) => h.type === "company" || h.type === "custom") || [];

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Calendar className="h-6 w-6" />
						Public Holidays
					</h1>
					<p className="text-muted-foreground">Manage statutory and company holidays</p>
				</div>
				<Button onClick={() => setAddDialogOpen(true)}>
					<Plus className="h-4 w-4 mr-2" />
					Add Company Holiday
				</Button>
			</div>

			{/* Year Selector */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => setYear(year - 1)}>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<span className="text-lg font-medium">{year}</span>
				<Button variant="ghost" size="icon" onClick={() => setYear(year + 1)}>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>

			{/* Public Holidays */}
			<Card>
				<CardHeader>
					<CardTitle>South African Public Holidays</CardTitle>
					<CardDescription>Statutory holidays are automatically applied. Toggle paid status as needed.</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Holiday</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Observed</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Pay Rule</TableHead>
								<TableHead className="text-center">Paid</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{publicHolidays.map((holiday) => (
								<TableRow key={holiday.id}>
									<TableCell className="font-medium">{holiday.name}</TableCell>
									<TableCell>{new Date(holiday.date).toLocaleDateString()}</TableCell>
									<TableCell>
										{holiday.observedDate ? new Date(holiday.observedDate).toLocaleDateString() : "-"}
									</TableCell>
									<TableCell>{getStatusBadge(holiday)}</TableCell>
									<TableCell>
										<Badge variant="outline">{PAY_RULE_LABELS[holiday.payRule]}</Badge>
									</TableCell>
									<TableCell className="text-center">
										<Switch
											checked={holiday.isPaid}
											onCheckedChange={(checked) => updateHoliday.mutate({ id: holiday.id, isPaid: checked })}
											disabled={holiday.isSystemHoliday && holiday.status === "default"}
										/>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Company Holidays */}
			<Card>
				<CardHeader>
					<CardTitle>Company Holidays</CardTitle>
					<CardDescription>Custom holidays specific to your organization</CardDescription>
				</CardHeader>
				<CardContent>
					{companyHolidays.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Holiday</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Scope</TableHead>
									<TableHead className="text-center">Paid</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{companyHolidays.map((holiday) => (
									<TableRow key={holiday.id}>
										<TableCell className="font-medium">{holiday.name}</TableCell>
										<TableCell>{new Date(holiday.date).toLocaleDateString()}</TableCell>
										<TableCell>
											<Badge variant="outline">
												{holiday.scope === "all" ? "All Employees" : "Pay Point Specific"}
											</Badge>
										</TableCell>
										<TableCell className="text-center">
											<Switch
												checked={holiday.isPaid}
												onCheckedChange={(checked) => updateHoliday.mutate({ id: holiday.id, isPaid: checked })}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-muted-foreground text-center py-8">No company holidays added for {year}</p>
					)}
				</CardContent>
			</Card>

			{/* Add Holiday Dialog */}
			<Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add Company Holiday</DialogTitle>
						<DialogDescription>Create a custom holiday for your organization</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Holiday Name</Label>
							<Input
								id="name"
								value={newHoliday.name}
								onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
								placeholder="e.g., Company Anniversary"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="date">Date</Label>
							<Input
								id="date"
								type="date"
								value={newHoliday.date}
								onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="scope">Scope</Label>
							<Select
								value={newHoliday.scope}
								onValueChange={(v) => setNewHoliday({ ...newHoliday, scope: v as "all" | "pay_point" })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Employees</SelectItem>
									<SelectItem value="pay_point">Specific Pay Points</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-center gap-2">
							<Switch
								id="isPaid"
								checked={newHoliday.isPaid}
								onCheckedChange={(checked) => setNewHoliday({ ...newHoliday, isPaid: checked })}
							/>
							<Label htmlFor="isPaid">Paid Holiday</Label>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setAddDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleAddHoliday} disabled={addCompanyHoliday.isPending}>
							{addCompanyHoliday.isPending ? "Adding..." : "Add Holiday"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

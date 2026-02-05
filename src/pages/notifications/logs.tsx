import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Bell, Download, Mail, Search } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import type { NotificationLog, NotificationStatus, NotificationChannel } from "@/types/notifications";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export default function NotificationLogsPage() {
	const [searchParams] = useSearchParams();
	const [filters, setFilters] = useState({
		status: searchParams.get("status") || "",
		channel: "",
		startDate: "",
		endDate: "",
	});
	const [searchTerm, setSearchTerm] = useState("");

	const { data: logs, isLoading } = useQuery({
		queryKey: ["notification-logs", filters],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (filters.status) params.append("status", filters.status);
			if (filters.channel) params.append("channel", filters.channel);
			if (filters.startDate) params.append("startDate", filters.startDate);
			if (filters.endDate) params.append("endDate", filters.endDate);
			const response = await axios.get(`/api/notifications/logs?${params.toString()}`);
			return response.data.data as NotificationLog[];
		},
	});

	const filteredLogs = logs?.filter((log) => {
		if (!searchTerm) return true;
		const search = searchTerm.toLowerCase();
		return (
			log.recipientName.toLowerCase().includes(search) ||
			log.recipientEmail.toLowerCase().includes(search) ||
			log.typeLabel.toLowerCase().includes(search) ||
			log.subject.toLowerCase().includes(search)
		);
	});

	const handleExport = () => {
		const csv = [
			["Sent At", "Type", "Recipient", "Email", "Channel", "Status", "Subject"].join(","),
			...(filteredLogs || []).map((log) =>
				[
					log.sentAt,
					log.typeLabel,
					log.recipientName,
					log.recipientEmail,
					log.channel,
					log.status,
					`"${log.subject}"`,
				].join(",")
			),
		].join("\n");

		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `notification-logs-${new Date().toISOString().split("T")[0]}.csv`;
		a.click();
	};

	const getStatusBadge = (status: NotificationStatus) => {
		switch (status) {
			case "sent":
				return <Badge className="bg-green-100 text-green-800">Sent</Badge>;
			case "read":
				return <Badge className="bg-blue-100 text-blue-800">Read</Badge>;
			case "failed":
				return <Badge variant="destructive">Failed</Badge>;
			case "pending":
				return <Badge variant="secondary">Pending</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const getChannelIcon = (channel: NotificationChannel) => {
		switch (channel) {
			case "email":
				return <Mail className="h-4 w-4" />;
			case "in_app":
				return <Bell className="h-4 w-4" />;
			default:
				return <Bell className="h-4 w-4" />;
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
						<Bell className="h-6 w-6" />
						Notification Logs
					</h1>
					<p className="text-muted-foreground">
						Complete history of all notifications sent
					</p>
				</div>
				<Button variant="outline" onClick={handleExport}>
					<Download className="h-4 w-4 mr-2" />
					Export CSV
				</Button>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-wrap gap-4 items-end">
						<div className="flex-1 min-w-[200px]">
							<Label className="sr-only">Search</Label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search by recipient, type, or subject..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-9"
								/>
							</div>
						</div>

						<div className="w-32">
							<Label className="text-xs text-muted-foreground">Status</Label>
							<Select
								value={filters.status}
								onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? "" : value })}
							>
								<SelectTrigger>
									<SelectValue placeholder="All" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="sent">Sent</SelectItem>
									<SelectItem value="read">Read</SelectItem>
									<SelectItem value="failed">Failed</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="w-32">
							<Label className="text-xs text-muted-foreground">Channel</Label>
							<Select
								value={filters.channel}
								onValueChange={(value) => setFilters({ ...filters, channel: value === "all" ? "" : value })}
							>
								<SelectTrigger>
									<SelectValue placeholder="All" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="email">Email</SelectItem>
									<SelectItem value="in_app">In-App</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="w-36">
							<Label className="text-xs text-muted-foreground">From</Label>
							<Input
								type="date"
								value={filters.startDate}
								onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
							/>
						</div>

						<div className="w-36">
							<Label className="text-xs text-muted-foreground">To</Label>
							<Input
								type="date"
								value={filters.endDate}
								onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
							/>
						</div>

						<Button
							variant="ghost"
							onClick={() => {
								setFilters({ status: "", channel: "", startDate: "", endDate: "" });
								setSearchTerm("");
							}}
						>
							Clear
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Logs Table */}
			<Card>
				<CardHeader>
					<CardTitle>Logs</CardTitle>
					<CardDescription>{filteredLogs?.length || 0} records found</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Sent At</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Recipient</TableHead>
									<TableHead>Channel</TableHead>
									<TableHead>Subject</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredLogs?.map((log) => (
									<TableRow key={log.id} className={log.status === "failed" ? "bg-destructive/5" : ""}>
										<TableCell className="whitespace-nowrap text-muted-foreground">
											{new Date(log.sentAt).toLocaleString()}
										</TableCell>
										<TableCell className="font-medium">{log.typeLabel}</TableCell>
										<TableCell>
											<div>
												<p>{log.recipientName}</p>
												<p className="text-xs text-muted-foreground">{log.recipientEmail}</p>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												{getChannelIcon(log.channel)}
												<span className="capitalize">{log.channel.replace("_", " ")}</span>
											</div>
										</TableCell>
										<TableCell className="max-w-xs truncate">{log.subject}</TableCell>
										<TableCell>
											{getStatusBadge(log.status)}
											{log.errorMessage && (
												<p className="text-xs text-destructive mt-1">{log.errorMessage}</p>
											)}
										</TableCell>
									</TableRow>
								))}
								{(!filteredLogs || filteredLogs.length === 0) && (
									<TableRow>
										<TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
											No notification logs found
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

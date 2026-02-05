import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertCircle, AlertTriangle, ArrowRight, Bell, Info } from "lucide-react";
import { useNavigate } from "react-router";

type AlertSeverity = "info" | "warning" | "critical";

interface Notification {
	id: string;
	type: AlertSeverity;
	title: string;
	message: string;
	action: string;
	createdAt: string;
	read: boolean;
}

const severityConfig: Record<AlertSeverity, { icon: typeof Info; bgColor: string; textColor: string; borderColor: string }> = {
	info: {
		icon: Info,
		bgColor: "bg-blue-500/10",
		textColor: "text-blue-600 dark:text-blue-400",
		borderColor: "border-l-blue-500",
	},
	warning: {
		icon: AlertTriangle,
		bgColor: "bg-orange-500/10",
		textColor: "text-orange-600 dark:text-orange-400",
		borderColor: "border-l-orange-500",
	},
	critical: {
		icon: AlertCircle,
		bgColor: "bg-red-500/10",
		textColor: "text-red-600 dark:text-red-400",
		borderColor: "border-l-red-500",
	},
};

function NotificationItem({ notification }: { notification: Notification }) {
	const navigate = useNavigate();
	const config = severityConfig[notification.type];
	const Icon = config.icon;

	return (
		<div
			className={`p-3 rounded-lg border-l-4 ${config.borderColor} ${config.bgColor} ${notification.read ? "opacity-60" : ""}`}
		>
			<div className="flex items-start gap-3">
				<Icon className={`h-5 w-5 mt-0.5 ${config.textColor}`} />
				<div className="flex-1 min-w-0">
					<p className="font-medium text-sm">{notification.title}</p>
					<p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
				</div>
				<Button
					variant="ghost"
					size="sm"
					className="flex-shrink-0"
					onClick={() => navigate(notification.action)}
				>
					<ArrowRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}

export function NotificationsWidget() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["dashboard", "notifications"],
		queryFn: async () => {
			const response = await axios.get("/api/dashboard/notifications");
			return response.data.data as Notification[];
		},
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						Notifications
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-16" />
					))}
				</CardContent>
			</Card>
		);
	}

	if (error || !data) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						Notifications
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Failed to load notifications</p>
				</CardContent>
			</Card>
		);
	}

	const unreadCount = data.filter((n) => !n.read).length;
	const criticalCount = data.filter((n) => n.type === "critical" && !n.read).length;

	return (
		<Card className={criticalCount > 0 ? "border-red-500/50" : ""}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Bell className={`h-5 w-5 ${criticalCount > 0 ? "text-red-500" : ""}`} />
						Notifications
						{unreadCount > 0 && (
							<Badge variant={criticalCount > 0 ? "destructive" : "secondary"}>
								{unreadCount}
							</Badge>
						)}
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				{data.length === 0 ? (
					<div className="text-center py-6 text-muted-foreground">
						<Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
						<p>No notifications</p>
					</div>
				) : (
					<div className="space-y-3">
						{data.slice(0, 5).map((notification) => (
							<NotificationItem key={notification.id} notification={notification} />
						))}
						{data.length > 5 && (
							<Button variant="ghost" className="w-full text-muted-foreground">
								View all {data.length} notifications
							</Button>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

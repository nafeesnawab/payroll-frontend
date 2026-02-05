import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Bell, Check, FileText, CalendarCheck, CalendarX, UserCheck, UserX } from "lucide-react";
import { useNavigate } from "react-router";
import type { ESSNotification } from "@/types/ess";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { ScrollArea } from "@/ui/scroll-area";
import { cn } from "@/utils";

const notificationIcons: Record<ESSNotification["type"], React.ElementType> = {
	payslip_released: FileText,
	leave_approved: CalendarCheck,
	leave_rejected: CalendarX,
	profile_change_approved: UserCheck,
	profile_change_rejected: UserX,
};

export function ESSNotificationBell() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: notifications = [] } = useQuery({
		queryKey: ["ess-notifications"],
		queryFn: async () => {
			const response = await axios.get("/api/ess/notifications");
			return response.data.data as ESSNotification[];
		},
	});

	const markAsRead = useMutation({
		mutationFn: async (id: string) => {
			await axios.put(`/api/ess/notifications/${id}/read`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ess-notifications"] });
		},
	});

	const markAllAsRead = useMutation({
		mutationFn: async () => {
			await axios.put("/api/ess/notifications/read-all");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ess-notifications"] });
		},
	});

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	const handleNotificationClick = (notification: ESSNotification) => {
		if (!notification.isRead) {
			markAsRead.mutate(notification.id);
		}

		if (notification.relatedId) {
			switch (notification.type) {
				case "payslip_released":
					navigate(`/ess/payslips/${notification.relatedId}`);
					break;
				case "leave_approved":
				case "leave_rejected":
					navigate("/ess/leave");
					break;
				case "profile_change_approved":
				case "profile_change_rejected":
					navigate("/ess/profile");
					break;
			}
		}
	};

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return "Just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
						>
							{unreadCount > 9 ? "9+" : unreadCount}
						</Badge>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-80 p-0">
				<div className="flex items-center justify-between border-b p-3">
					<h4 className="font-semibold">Notifications</h4>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => markAllAsRead.mutate()}
							disabled={markAllAsRead.isPending}
						>
							<Check className="h-4 w-4 mr-1" />
							Mark all read
						</Button>
					)}
				</div>
				<ScrollArea className="h-80">
					{notifications.length === 0 ? (
						<div className="p-6 text-center text-muted-foreground">
							<Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
							<p>No notifications</p>
						</div>
					) : (
						<div className="divide-y">
							{notifications.map((notification) => {
								const Icon = notificationIcons[notification.type];
								return (
									<button
										type="button"
										key={notification.id}
										onClick={() => handleNotificationClick(notification)}
										className={cn(
											"w-full flex items-start gap-3 p-3 text-left hover:bg-muted transition-colors",
											!notification.isRead && "bg-primary/5"
										)}
									>
										<div
											className={cn(
												"mt-0.5 p-1.5 rounded-full",
												notification.type.includes("approved")
													? "bg-green-100 text-green-600"
													: notification.type.includes("rejected")
														? "bg-red-100 text-red-600"
														: "bg-blue-100 text-blue-600"
											)}
										>
											<Icon className="h-4 w-4" />
										</div>
										<div className="flex-1 min-w-0">
											<p
												className={cn(
													"text-sm truncate",
													!notification.isRead && "font-medium"
												)}
											>
												{notification.title}
											</p>
											<p className="text-xs text-muted-foreground line-clamp-2">
												{notification.message}
											</p>
											<p className="text-xs text-muted-foreground mt-1">
												{formatDate(notification.createdAt)}
											</p>
										</div>
										{!notification.isRead && (
											<div className="w-2 h-2 rounded-full bg-primary mt-2" />
										)}
									</button>
								);
							})}
						</div>
					)}
				</ScrollArea>
			</PopoverContent>
		</Popover>
	);
}

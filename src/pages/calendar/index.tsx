import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import type { CalendarEvent, CalendarOverview } from "@/types/calendar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";
import { Label } from "@/ui/label";
import { Skeleton } from "@/ui/skeleton";

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarOverviewPage() {
	const navigate = useNavigate();
	const [currentDate, setCurrentDate] = useState(new Date());
	const [layers, setLayers] = useState({
		holidays: true,
		leave: true,
		payroll: true,
	});

	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();

	const { data: overview, isLoading } = useQuery({
		queryKey: ["calendar-overview", year, month],
		queryFn: async () => {
			const response = await axios.get(`/api/calendar/overview?year=${year}&month=${month + 1}`);
			return response.data.data as CalendarOverview;
		},
	});

	const getDaysInMonth = (year: number, month: number) => {
		return new Date(year, month + 1, 0).getDate();
	};

	const getFirstDayOfMonth = (year: number, month: number) => {
		return new Date(year, month, 1).getDay();
	};

	const navigateMonth = (direction: number) => {
		setCurrentDate(new Date(year, month + direction, 1));
	};

	const getEventsForDate = (day: number): CalendarEvent[] => {
		const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
		return (overview?.events || []).filter((e) => {
			if (e.date !== dateStr) return false;
			if (e.type === "holiday" && !layers.holidays) return false;
			if (e.type === "leave" && !layers.leave) return false;
			if ((e.type === "pay_date" || e.type === "payroll_cutoff") && !layers.payroll) return false;
			return true;
		});
	};

	const renderCalendarDays = () => {
		const daysInMonth = getDaysInMonth(year, month);
		const firstDay = getFirstDayOfMonth(year, month);
		const days = [];

		for (let i = 0; i < firstDay; i++) {
			days.push(<div key={`empty-${i}`} className="h-24 bg-muted/30" />);
		}

		for (let day = 1; day <= daysInMonth; day++) {
			const events = getEventsForDate(day);
			const isToday =
				new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

			days.push(
				<div key={day} className={`h-24 border-t p-1 ${isToday ? "bg-primary/5" : "hover:bg-muted/50"}`}>
					<div className="flex items-center justify-between">
						<span
							className={`text-sm font-medium ${
								isToday
									? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
									: ""
							}`}
						>
							{day}
						</span>
					</div>
					<div className="mt-1 space-y-1 overflow-hidden">
						{events.slice(0, 2).map((event) => (
							<div
								key={event.id}
								className="text-xs px-1 py-0.5 rounded truncate"
								style={{ backgroundColor: event.color + "20", color: event.color }}
							>
								{event.title}
							</div>
						))}
						{events.length > 2 && <div className="text-xs text-muted-foreground">+{events.length - 2} more</div>}
					</div>
				</div>,
			);
		}

		return days;
	};

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-[600px]" />
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<CalendarIcon className="h-6 w-6" />
						Calendar
					</h1>
					<p className="text-muted-foreground">View holidays, pay dates, and payroll events</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => navigate("/calendar/holidays")}>
						Manage Holidays
					</Button>
					<Button variant="outline" onClick={() => navigate("/calendar/settings")}>
						<Settings className="h-4 w-4 mr-2" />
						Settings
					</Button>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-4">
				{/* Calendar */}
				<div className="lg:col-span-3">
					<Card>
						<CardHeader className="pb-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
										<ChevronLeft className="h-4 w-4" />
									</Button>
									<CardTitle>
										{MONTHS[month]} {year}
									</CardTitle>
									<Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
										<ChevronRight className="h-4 w-4" />
									</Button>
								</div>
								<Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
									Today
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-7 gap-px bg-muted">
								{WEEKDAYS.map((day) => (
									<div key={day} className="bg-background p-2 text-center text-sm font-medium">
										{day}
									</div>
								))}
								{renderCalendarDays()}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Layer Toggles */}
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-base">Show Layers</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center gap-2">
								<Checkbox
									id="holidays"
									checked={layers.holidays}
									onCheckedChange={(checked) => setLayers({ ...layers, holidays: !!checked })}
								/>
								<Label htmlFor="holidays" className="flex items-center gap-2">
									<div className="w-3 h-3 rounded-full bg-red-500" />
									Holidays
								</Label>
							</div>
							<div className="flex items-center gap-2">
								<Checkbox
									id="leave"
									checked={layers.leave}
									onCheckedChange={(checked) => setLayers({ ...layers, leave: !!checked })}
								/>
								<Label htmlFor="leave" className="flex items-center gap-2">
									<div className="w-3 h-3 rounded-full bg-blue-500" />
									Leave
								</Label>
							</div>
							<div className="flex items-center gap-2">
								<Checkbox
									id="payroll"
									checked={layers.payroll}
									onCheckedChange={(checked) => setLayers({ ...layers, payroll: !!checked })}
								/>
								<Label htmlFor="payroll" className="flex items-center gap-2">
									<div className="w-3 h-3 rounded-full bg-green-500" />
									Payroll Events
								</Label>
							</div>
						</CardContent>
					</Card>

					{/* Upcoming Holidays */}
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-base">Upcoming Holidays</CardTitle>
						</CardHeader>
						<CardContent>
							{overview?.upcomingHolidays && overview.upcomingHolidays.length > 0 ? (
								<div className="space-y-3">
									{overview.upcomingHolidays.slice(0, 5).map((holiday) => (
										<div key={holiday.id} className="flex items-center justify-between">
											<div>
												<p className="text-sm font-medium">{holiday.name}</p>
												<p className="text-xs text-muted-foreground">{new Date(holiday.date).toLocaleDateString()}</p>
											</div>
											<Badge variant={holiday.isPaid ? "default" : "secondary"}>
												{holiday.isPaid ? "Paid" : "Unpaid"}
											</Badge>
										</div>
									))}
								</div>
							) : (
								<p className="text-sm text-muted-foreground">No upcoming holidays</p>
							)}
						</CardContent>
					</Card>

					{/* Pay Dates */}
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-base">Pay Schedule</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{overview?.nextCutoffDate && (
								<div>
									<p className="text-xs text-muted-foreground">Next Cutoff</p>
									<p className="font-medium">{new Date(overview.nextCutoffDate).toLocaleDateString()}</p>
								</div>
							)}
							{overview?.nextPayDate && (
								<div>
									<p className="text-xs text-muted-foreground">Next Pay Date</p>
									<p className="font-medium text-green-600">{new Date(overview.nextPayDate).toLocaleDateString()}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

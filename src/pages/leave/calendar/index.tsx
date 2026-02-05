import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import type { LeaveCalendarEvent, LeaveType } from "@/types/leave";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

function getDaysInMonth(year: number, month: number) {
	return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
	return new Date(year, month, 1).getDay();
}

export default function LeaveCalendarPage() {
	const navigate = useNavigate();
	const today = new Date();
	const [currentYear, setCurrentYear] = useState(today.getFullYear());
	const [currentMonth, setCurrentMonth] = useState(today.getMonth());
	const [typeFilter, setTypeFilter] = useState("all");

	const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

	const { data: events, isLoading } = useQuery({
		queryKey: ["leave-calendar", monthStr],
		queryFn: async () => {
			const response = await axios.get(`/api/leave/calendar?month=${monthStr}`);
			return response.data.data as LeaveCalendarEvent[];
		},
	});

	const { data: leaveTypes } = useQuery({
		queryKey: ["leave-types"],
		queryFn: async () => {
			const response = await axios.get("/api/leave/types");
			return response.data.data as LeaveType[];
		},
	});

	const filteredEvents = typeFilter === "all" ? events : events?.filter((e) => e.leaveTypeId === typeFilter);

	const prevMonth = () => {
		if (currentMonth === 0) {
			setCurrentMonth(11);
			setCurrentYear(currentYear - 1);
		} else {
			setCurrentMonth(currentMonth - 1);
		}
	};

	const nextMonth = () => {
		if (currentMonth === 11) {
			setCurrentMonth(0);
			setCurrentYear(currentYear + 1);
		} else {
			setCurrentMonth(currentMonth + 1);
		}
	};

	const daysInMonth = getDaysInMonth(currentYear, currentMonth);
	const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

	const getEventsForDay = (day: number) => {
		const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
		return (
			filteredEvents?.filter((e) => {
				return dateStr >= e.startDate && dateStr <= e.endDate;
			}) || []
		);
	};

	const calendarDays = [];
	for (let i = 0; i < firstDay; i++) {
		calendarDays.push(null);
	}
	for (let day = 1; day <= daysInMonth; day++) {
		calendarDays.push(day);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => navigate("/leave")}>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div className="flex-1">
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<CalendarDays className="h-6 w-6" />
						Leave Calendar
					</h1>
					<p className="text-muted-foreground">Visual overview of approved leave</p>
				</div>
				<Select value={typeFilter} onValueChange={setTypeFilter}>
					<SelectTrigger className="w-48">
						<SelectValue placeholder="Leave Type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Types</SelectItem>
						{leaveTypes?.map((lt) => (
							<SelectItem key={lt.id} value={lt.id}>
								{lt.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<Button variant="outline" size="icon" onClick={prevMonth}>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<CardTitle>
							{MONTHS[currentMonth]} {currentYear}
						</CardTitle>
						<Button variant="outline" size="icon" onClick={nextMonth}>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Skeleton className="h-96 w-full" />
					) : (
						<div className="grid grid-cols-7 gap-1">
							{DAYS.map((day) => (
								<div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
									{day}
								</div>
							))}
							{calendarDays.map((day, index) => {
								const dayEvents = day ? getEventsForDay(day) : [];
								const isToday =
									day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
								return (
									<div
										key={`day-${index}`}
										className={`min-h-24 p-1 border rounded-lg ${day ? "bg-background" : "bg-muted/30"} ${isToday ? "ring-2 ring-primary" : ""}`}
									>
										{day && (
											<>
												<p className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>{day}</p>
												<div className="space-y-1">
													{dayEvents.slice(0, 3).map((event) => (
														<div
															key={event.id}
															className="text-xs p-1 rounded truncate text-white"
															style={{ backgroundColor: event.color }}
															title={`${event.employeeName} - ${event.leaveTypeName}`}
														>
															{event.employeeName.split(" ")[0]}
														</div>
													))}
													{dayEvents.length > 3 && (
														<p className="text-xs text-muted-foreground">+{dayEvents.length - 3} more</p>
													)}
												</div>
											</>
										)}
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>

			{filteredEvents && filteredEvents.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Leave This Month</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{filteredEvents.map((event) => (
								<div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
									<div className="flex items-center gap-3">
										<div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.color }} />
										<div>
											<p className="font-medium">{event.employeeName}</p>
											<p className="text-sm text-muted-foreground">
												{event.startDate} - {event.endDate}
											</p>
										</div>
									</div>
									<Badge variant="outline">{event.leaveTypeName}</Badge>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

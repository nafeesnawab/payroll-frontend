import { CalendarDays, FileText, Home, LogOut, Menu, User, X } from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import Logo from "@/components/logo";
import { useAuthActions } from "@/store/authStore";
import { Avatar, AvatarFallback } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/ui/sheet";
import { cn } from "@/utils";
import { ESSNotificationBell } from "./notification-bell";

const navItems = [
	{ path: "/ess", label: "Dashboard", icon: Home },
	{ path: "/ess/payslips", label: "Payslips", icon: FileText },
	{ path: "/ess/leave", label: "Leave", icon: CalendarDays },
	{ path: "/ess/profile", label: "Profile", icon: User },
	{ path: "/ess/documents", label: "Documents", icon: FileText },
];

export default function ESSLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const { logout } = useAuthActions();
	const [mobileOpen, setMobileOpen] = useState(false);

	const handleSignOut = () => {
		logout();
		navigate("/auth/login");
	};

	const isActive = (path: string) => {
		if (path === "/ess") return location.pathname === "/ess";
		return location.pathname.startsWith(path);
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-14 items-center justify-between px-4">
					<div className="flex items-center gap-4">
						{/* Mobile Menu */}
						<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
							<SheetTrigger asChild className="md:hidden">
								<Button variant="ghost" size="icon">
									<Menu className="h-5 w-5" />
								</Button>
							</SheetTrigger>
							<SheetContent side="left" className="w-64 p-0">
								<div className="flex h-14 items-center border-b px-4">
									<Logo />
									<Button variant="ghost" size="icon" className="ml-auto" onClick={() => setMobileOpen(false)}>
										<X className="h-5 w-5" />
									</Button>
								</div>
								<nav className="flex flex-col gap-1 p-4">
									{navItems.map((item) => (
										<Link
											key={item.path}
											to={item.path}
											onClick={() => setMobileOpen(false)}
											className={cn(
												"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
												isActive(item.path) ? "bg-primary text-primary-foreground" : "hover:bg-muted",
											)}
										>
											<item.icon className="h-4 w-4" />
											{item.label}
										</Link>
									))}
								</nav>
							</SheetContent>
						</Sheet>

						<Link to="/ess" className="flex items-center gap-2">
							<Logo />
							<Badge variant="secondary" className="hidden sm:inline-flex">
								Employee Portal
							</Badge>
						</Link>
					</div>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center gap-1">
						{navItems.map((item) => (
							<Link
								key={item.path}
								to={item.path}
								className={cn(
									"flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
									isActive(item.path)
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:bg-muted hover:text-foreground",
								)}
							>
								<item.icon className="h-4 w-4" />
								{item.label}
							</Link>
						))}
					</nav>

					{/* Right Side */}
					<div className="flex items-center gap-2">
						<ESSNotificationBell />

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="rounded-full">
									<Avatar className="h-8 w-8">
										<AvatarFallback>ME</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-48">
								<DropdownMenuItem onClick={() => navigate("/ess/profile")}>
									<User className="h-4 w-4 mr-2" />
									My Profile
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleSignOut} className="text-destructive">
									<LogOut className="h-4 w-4 mr-2" />
									Sign Out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="container px-4 py-6">
				<Outlet />
			</main>

			{/* Footer */}
			<footer className="border-t py-4 mt-auto">
				<div className="container px-4 text-center text-sm text-muted-foreground">
					<p>PayPilot Employee Self-Service Portal</p>
				</div>
			</footer>
		</div>
	);
}

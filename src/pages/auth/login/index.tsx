import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import Logo from "@/components/logo";
import { GLOBAL_CONFIG } from "@/global-config";
import { useAuthActions, useIsAuthenticated } from "@/store/authStore";
import type { LoginRequest } from "@/types/auth";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

const loginSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const navigate = useNavigate();
	const isAuthenticated = useIsAuthenticated();
	const { setUser, setToken, setCompanies, setActiveCompany, setRequiresTwoFactor, setOnboardingComplete } =
		useAuthActions();
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const loginMutation = useMutation({
		mutationFn: async (data: LoginRequest) => {
			const response = await axios.post("/api/auth/login", data);
			return response.data;
		},
		onSuccess: (response) => {
			if (response.status === "success") {
				const { user, companies, token, requiresTwoFactor, hasCompletedOnboarding } = response.data;

				if (requiresTwoFactor) {
					setUser(user);
					setRequiresTwoFactor(true, user.id);
					navigate("/auth/2fa", { replace: true });
					return;
				}

				setUser(user);
				setToken(token);
				setCompanies(companies);
				if (hasCompletedOnboarding !== undefined) {
					setOnboardingComplete(hasCompletedOnboarding);
				}

				if (companies.length > 1) {
					navigate("/auth/companies", { replace: true });
				} else if (companies.length === 1) {
					setActiveCompany(companies[0].company, companies[0].role);
					toast.success("Welcome back!");
					navigate(GLOBAL_CONFIG.defaultRoute, { replace: true });
				} else {
					toast.error("No companies found for this account");
				}
			}
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Invalid email or password";
			toast.error(message);
		},
	});

	if (isAuthenticated) {
		return <Navigate to={GLOBAL_CONFIG.defaultRoute} replace />;
	}

	const onSubmit = (data: LoginFormValues) => {
		loginMutation.mutate(data);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center space-y-4">
					<div className="flex justify-center">
						<div className="flex items-center gap-2">
							<Logo size={32} />
							<span className="text-xl font-bold">{GLOBAL_CONFIG.appName}</span>
						</div>
					</div>
					<div>
						<CardTitle className="text-2xl">Welcome back</CardTitle>
						<CardDescription className="mt-2">Sign in to your account to continue</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email Address</FormLabel>
										<FormControl>
											<Input type="email" placeholder="john@company.co.za" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center justify-between">
											<FormLabel>Password</FormLabel>
											<Link to="/auth/forgot-password" className="text-sm text-primary hover:underline">
												Forgot password?
											</Link>
										</div>
										<FormControl>
											<div className="relative">
												<Input type={showPassword ? "text" : "password"} placeholder="Enter your password" {...field} />
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
													onClick={() => setShowPassword(!showPassword)}
												>
													{showPassword ? (
														<EyeOff className="h-4 w-4 text-muted-foreground" />
													) : (
														<Eye className="h-4 w-4 text-muted-foreground" />
													)}
												</Button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit" className="w-full" disabled={loginMutation.isPending}>
								{loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Sign In
							</Button>

							<div className="text-center text-sm text-muted-foreground">
								Don't have an account?{" "}
								<Link to="/auth/signup" className="font-medium text-primary hover:underline">
									Create account
								</Link>
							</div>

							<div className="relative my-4">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-border" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-card px-2 text-muted-foreground">Demo accounts</span>
								</div>
							</div>

							<div className="space-y-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
								<p>
									<strong>Multi-company + 2FA:</strong>
								</p>
								<p className="font-mono text-xs">demo@paypilot.co.za / Demo@123</p>
								<p className="text-xs">(2FA code: 123456)</p>
								<p className="mt-2">
									<strong>Single company:</strong>
								</p>
								<p className="font-mono text-xs">single@paypilot.co.za / Single@123</p>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}

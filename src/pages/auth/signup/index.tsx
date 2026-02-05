import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Building2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import Logo from "@/components/logo";
import { GLOBAL_CONFIG } from "@/global-config";
import { useAuthActions, useIsAuthenticated } from "@/store/authStore";
import type { SignUpRequest } from "@/types/auth";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

const signUpSchema = z
	.object({
		companyName: z.string().min(2, "Company name must be at least 2 characters"),
		fullName: z.string().min(2, "Full name must be at least 2 characters"),
		email: z.string().email("Please enter a valid email address"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(/[0-9]/, "Password must contain at least one number")
			.regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
	const navigate = useNavigate();
	const isAuthenticated = useIsAuthenticated();
	const { setUser, setToken, setCompanies, setActiveCompany, setOnboardingComplete } = useAuthActions();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const form = useForm<SignUpFormValues>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			companyName: "",
			fullName: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const signUpMutation = useMutation({
		mutationFn: async (data: SignUpRequest) => {
			const response = await axios.post("/api/auth/signup", data);
			return response.data;
		},
		onSuccess: (response) => {
			if (response.status === "success") {
				const { user, company, token } = response.data;
				setUser(user);
				setToken(token);
				setCompanies([{ id: company.id, companyId: company.id, userId: user.id, role: "owner", company }]);
				setActiveCompany(company, "owner");
				setOnboardingComplete(false);
				toast.success("Account created successfully!");
				navigate("/settings/employer", { replace: true });
			}
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Failed to create account";
			toast.error(message);
		},
	});

	if (isAuthenticated) {
		return <Navigate to={GLOBAL_CONFIG.defaultRoute} replace />;
	}

	const onSubmit = (data: SignUpFormValues) => {
		const { confirmPassword: _, ...signUpData } = data;
		signUpMutation.mutate(signUpData);
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
						<CardTitle className="text-2xl">Create your account</CardTitle>
						<CardDescription className="mt-2">Start managing your payroll in minutes</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="companyName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Company Name</FormLabel>
										<FormControl>
											<div className="relative">
												<Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
												<Input placeholder="Acme Corporation (Pty) Ltd" className="pl-10" {...field} />
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="fullName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Full Name</FormLabel>
										<FormControl>
											<Input placeholder="John Doe" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

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
										<FormLabel>Password</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={showPassword ? "text" : "password"}
													placeholder="Min 8 chars, 1 number, 1 special char"
													{...field}
												/>
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

							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Confirm Password</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={showConfirmPassword ? "text" : "password"}
													placeholder="Re-enter your password"
													{...field}
												/>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
													onClick={() => setShowConfirmPassword(!showConfirmPassword)}
												>
													{showConfirmPassword ? (
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

							<Button type="submit" className="w-full" disabled={signUpMutation.isPending}>
								{signUpMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Create Account
							</Button>

							<div className="text-center text-sm text-muted-foreground">
								Already have an account?{" "}
								<Link to="/auth/login" className="font-medium text-primary hover:underline">
									Sign in
								</Link>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}

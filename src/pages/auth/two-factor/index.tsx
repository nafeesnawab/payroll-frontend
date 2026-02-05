import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { toast } from "sonner";
import Logo from "@/components/logo";
import { GLOBAL_CONFIG } from "@/global-config";
import { useAuthActions, useAuthUser, useIsAuthenticated, useRequiresTwoFactor } from "@/store/authStore";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/ui/input-otp";

export default function TwoFactorPage() {
	const navigate = useNavigate();
	const isAuthenticated = useIsAuthenticated();
	const { requires, userId } = useRequiresTwoFactor();
	const user = useAuthUser();
	const { setUser, setToken, setCompanies, setActiveCompany, setRequiresTwoFactor, setOnboardingComplete } =
		useAuthActions();
	const [code, setCode] = useState("");

	const verify2FAMutation = useMutation({
		mutationFn: async (data: { code: string; userId: string }) => {
			const response = await axios.post("/api/auth/verify-2fa", data);
			return response.data;
		},
		onSuccess: (response) => {
			if (response.status === "success") {
				const { user, companies, token, hasCompletedOnboarding } = response.data;

				setUser(user);
				setToken(token);
				setCompanies(companies);
				setRequiresTwoFactor(false);
				if (hasCompletedOnboarding !== undefined) {
					setOnboardingComplete(hasCompletedOnboarding);
				}

				if (companies.length > 1) {
					navigate("/auth/companies", { replace: true });
				} else if (companies.length === 1) {
					setActiveCompany(companies[0].company, companies[0].role);
					toast.success("Welcome back!");
					navigate(GLOBAL_CONFIG.defaultRoute, { replace: true });
				}
			}
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Invalid verification code";
			toast.error(message);
			setCode("");
		},
	});

	if (isAuthenticated) {
		return <Navigate to={GLOBAL_CONFIG.defaultRoute} replace />;
	}

	if (!requires || !userId) {
		return <Navigate to="/auth/login" replace />;
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (code.length === 6) {
			verify2FAMutation.mutate({ code, userId });
		}
	};

	const handleComplete = (value: string) => {
		setCode(value);
		if (value.length === 6) {
			verify2FAMutation.mutate({ code: value, userId });
		}
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
					<div className="flex justify-center">
						<div className="rounded-full bg-primary/10 p-3">
							<ShieldCheck className="h-8 w-8 text-primary" />
						</div>
					</div>
					<div>
						<CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
						<CardDescription className="mt-2">
							Enter the 6-digit code from your authenticator app
							{user?.email && <span className="block mt-1 font-medium text-foreground">{user.email}</span>}
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="flex justify-center">
							<InputOTP
								maxLength={6}
								value={code}
								onChange={setCode}
								onComplete={handleComplete}
								disabled={verify2FAMutation.isPending}
							>
								<InputOTPGroup>
									<InputOTPSlot index={0} />
									<InputOTPSlot index={1} />
									<InputOTPSlot index={2} />
									<InputOTPSlot index={3} />
									<InputOTPSlot index={4} />
									<InputOTPSlot index={5} />
								</InputOTPGroup>
							</InputOTP>
						</div>

						<Button type="submit" className="w-full" disabled={code.length !== 6 || verify2FAMutation.isPending}>
							{verify2FAMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Verify Code
						</Button>

						<div className="text-center space-y-2">
							<Button
								type="button"
								variant="ghost"
								className="text-sm text-muted-foreground"
								onClick={() => toast.info("Check console for demo code: 123456")}
							>
								Didn't receive a code? Resend
							</Button>

							<div>
								<Link
									to="/auth/login"
									className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
									onClick={() => setRequiresTwoFactor(false)}
								>
									<ArrowLeft className="h-4 w-4" />
									Back to login
								</Link>
							</div>
						</div>

						<div className="text-center text-xs text-muted-foreground bg-muted/50 p-2 rounded">
							Demo: Use code <strong>123456</strong>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

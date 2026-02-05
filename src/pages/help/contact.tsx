import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Mail, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { CreateTicketInput, TicketPriority } from "@/types/help";
import { Alert, AlertDescription } from "@/ui/alert";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";

const ISSUE_CATEGORIES = [
	{ value: "payroll", label: "Payroll Issues" },
	{ value: "employees", label: "Employee Management" },
	{ value: "leave", label: "Leave Management" },
	{ value: "filings", label: "Statutory Filings" },
	{ value: "billing", label: "Billing & Subscription" },
	{ value: "technical", label: "Technical Problem" },
	{ value: "feature", label: "Feature Request" },
	{ value: "other", label: "Other" },
];

export default function ContactSupportPage() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState<CreateTicketInput>({
		category: "",
		subject: "",
		description: "",
		priority: "medium",
	});

	const submitTicket = useMutation({
		mutationFn: async (data: CreateTicketInput) => {
			const response = await axios.post("/api/help/ticket", data);
			return response.data;
		},
		onSuccess: () => {
			toast.success("Support ticket submitted successfully");
			navigate("/help");
		},
		onError: () => {
			toast.error("Failed to submit ticket");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.category || !formData.subject || !formData.description) {
			toast.error("Please fill in all required fields");
			return;
		}
		submitTicket.mutate(formData);
	};

	return (
		<div className="p-6 space-y-6 max-w-2xl mx-auto">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => navigate("/help")}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<MessageSquare className="h-6 w-6" />
						Contact Support
					</h1>
					<p className="text-muted-foreground">
						Submit a ticket or reach out to our team
					</p>
				</div>
			</div>

			{/* Contact Options */}
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-base flex items-center gap-2">
							<Mail className="h-4 w-4" />
							Email Support
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-2">
							Send us an email directly
						</p>
						<a
							href="mailto:support@paypilot.co.za"
							className="text-primary hover:underline"
						>
							support@paypilot.co.za
						</a>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-base flex items-center gap-2">
							<MessageSquare className="h-4 w-4" />
							Response Time
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							We typically respond within <strong>24 hours</strong> during business days.
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Ticket Form */}
			<Card>
				<CardHeader>
					<CardTitle>Submit a Support Ticket</CardTitle>
					<CardDescription>
						Describe your issue and we'll get back to you as soon as possible
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="category">Issue Category *</Label>
								<Select
									value={formData.category}
									onValueChange={(v) => setFormData({ ...formData, category: v })}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent>
										{ISSUE_CATEGORIES.map((cat) => (
											<SelectItem key={cat.value} value={cat.value}>
												{cat.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="priority">Priority</Label>
								<Select
									value={formData.priority}
									onValueChange={(v) =>
										setFormData({ ...formData, priority: v as TicketPriority })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">Low</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="high">High</SelectItem>
										<SelectItem value="urgent">Urgent</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="subject">Subject *</Label>
							<Input
								id="subject"
								value={formData.subject}
								onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
								placeholder="Brief description of your issue"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description *</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								placeholder="Please provide as much detail as possible..."
								rows={6}
							/>
						</div>

						<Alert>
							<AlertDescription>
								For faster resolution, please include:
								<ul className="list-disc list-inside mt-2 text-sm">
									<li>Steps to reproduce the issue</li>
									<li>Any error messages you see</li>
									<li>The browser and device you're using</li>
								</ul>
							</AlertDescription>
						</Alert>

						<Button type="submit" className="w-full" disabled={submitTicket.isPending}>
							<Send className="h-4 w-4 mr-2" />
							{submitTicket.isPending ? "Submitting..." : "Submit Ticket"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

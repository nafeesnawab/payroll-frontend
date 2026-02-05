import { http, HttpResponse, delay } from "msw";
import type {
	HelpArticle,
	HelpCategory,
	OnboardingProgress,
	SystemStatusInfo,
	SupportTicket,
} from "@/types/help";

const helpCategories: HelpCategory[] = [
	{
		id: "cat-1",
		name: "Getting Started",
		slug: "getting_started",
		description: "Set up your account and run your first payroll",
		articleCount: 8,
		icon: "rocket",
	},
	{
		id: "cat-2",
		name: "Payroll",
		slug: "payroll",
		description: "Processing payroll, calculations, and payslips",
		articleCount: 15,
		icon: "dollar-sign",
	},
	{
		id: "cat-3",
		name: "Employees",
		slug: "employees",
		description: "Adding and managing employee records",
		articleCount: 12,
		icon: "users",
	},
	{
		id: "cat-4",
		name: "Leave Management",
		slug: "leave",
		description: "Leave types, balances, and requests",
		articleCount: 9,
		icon: "calendar",
	},
	{
		id: "cat-5",
		name: "Compliance & Filings",
		slug: "compliance",
		description: "EMP201, UIF, IRP5, and statutory requirements",
		articleCount: 11,
		icon: "shield",
	},
	{
		id: "cat-6",
		name: "Settings",
		slug: "settings",
		description: "Configure your company and payroll settings",
		articleCount: 7,
		icon: "settings",
	},
	{
		id: "cat-7",
		name: "Troubleshooting",
		slug: "troubleshooting",
		description: "Common issues and how to resolve them",
		articleCount: 6,
		icon: "help-circle",
	},
];

const helpArticles: HelpArticle[] = [
	{
		id: "art-1",
		title: "How to run your first payroll",
		slug: "first-payroll",
		category: "getting_started",
		categoryLabel: "Getting Started",
		excerpt: "A step-by-step guide to processing your first payroll in PayPilot.",
		content: "Full article content here...",
		isPopular: true,
		viewCount: 1250,
		updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
	},
	{
		id: "art-2",
		title: "Understanding PAYE calculations",
		slug: "paye-calculations",
		category: "payroll",
		categoryLabel: "Payroll",
		excerpt: "Learn how PAYE is calculated based on SARS tax tables.",
		content: "Full article content here...",
		isPopular: true,
		viewCount: 980,
		updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
	},
	{
		id: "art-3",
		title: "Adding a new employee",
		slug: "add-employee",
		category: "employees",
		categoryLabel: "Employees",
		excerpt: "How to add employees and configure their payroll settings.",
		content: "Full article content here...",
		isPopular: true,
		viewCount: 850,
		updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
	},
	{
		id: "art-4",
		title: "Setting up leave types",
		slug: "leave-types",
		category: "leave",
		categoryLabel: "Leave Management",
		excerpt: "Configure annual, sick, and custom leave types for your company.",
		content: "Full article content here...",
		isPopular: false,
		viewCount: 420,
		updatedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
	},
	{
		id: "art-5",
		title: "Filing EMP201 returns",
		slug: "emp201-filing",
		category: "compliance",
		categoryLabel: "Compliance & Filings",
		excerpt: "Step-by-step guide to submitting your monthly EMP201 to SARS.",
		content: "Full article content here...",
		isPopular: true,
		viewCount: 720,
		updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
	},
	{
		id: "art-6",
		title: "Configuring bank details for EFT",
		slug: "bank-eft-setup",
		category: "settings",
		categoryLabel: "Settings",
		excerpt: "Set up your company bank account for salary payments.",
		content: "Full article content here...",
		isPopular: false,
		viewCount: 380,
		updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
	},
	{
		id: "art-7",
		title: "Why is my payroll showing errors?",
		slug: "payroll-errors",
		category: "troubleshooting",
		categoryLabel: "Troubleshooting",
		excerpt: "Common payroll errors and how to fix them.",
		content: "Full article content here...",
		isPopular: true,
		viewCount: 650,
		updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
	},
];

let onboardingProgress: OnboardingProgress = {
	completedSteps: 2,
	totalSteps: 5,
	percentComplete: 40,
	isDismissed: false,
	steps: [
		{
			id: "step-1",
			title: "Complete employer details",
			description: "Add your company information",
			isCompleted: true,
			route: "/settings/employer",
			order: 1,
		},
		{
			id: "step-2",
			title: "Add tax numbers",
			description: "Configure PAYE, UIF, and SDL",
			isCompleted: true,
			route: "/settings/paye",
			order: 2,
		},
		{
			id: "step-3",
			title: "Add employees",
			description: "Add at least one employee",
			isCompleted: false,
			route: "/employees/new",
			order: 3,
		},
		{
			id: "step-4",
			title: "Configure bank details",
			description: "Set up EFT payments",
			isCompleted: false,
			route: "/settings/banking",
			order: 4,
		},
		{
			id: "step-5",
			title: "Run test payroll",
			description: "Process a test payroll run",
			isCompleted: false,
			route: "/payroll/new",
			order: 5,
		},
	],
};

const systemStatus: SystemStatusInfo = {
	status: "operational",
	message: "All systems operational",
	updatedAt: new Date().toISOString(),
};

export const helpHandlers = [
	// Categories
	http.get("/api/help/categories", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: helpCategories });
	}),

	// Articles
	http.get("/api/help/articles", async ({ request }) => {
		await delay(200);
		const url = new URL(request.url);
		const category = url.searchParams.get("category");
		const search = url.searchParams.get("search")?.toLowerCase();
		const popular = url.searchParams.get("popular");

		let filtered = [...helpArticles];

		if (category) {
			filtered = filtered.filter((a) => a.category === category);
		}

		if (search) {
			filtered = filtered.filter(
				(a) =>
					a.title.toLowerCase().includes(search) ||
					a.excerpt.toLowerCase().includes(search)
			);
		}

		if (popular === "true") {
			filtered = filtered.filter((a) => a.isPopular);
		}

		return HttpResponse.json({ status: "success", data: filtered });
	}),

	// Single Article
	http.get("/api/help/articles/:slug", async ({ params }) => {
		await delay(200);
		const article = helpArticles.find((a) => a.slug === params.slug);
		if (!article) {
			return HttpResponse.json({ status: "error", message: "Article not found" }, { status: 404 });
		}
		return HttpResponse.json({ status: "success", data: article });
	}),

	// Submit Ticket
	http.post("/api/help/ticket", async ({ request }) => {
		await delay(500);
		const body = (await request.json()) as {
			category: string;
			subject: string;
			description: string;
			priority: string;
		};

		const ticket: SupportTicket = {
			id: `ticket-${Date.now()}`,
			subject: body.subject,
			category: body.category,
			description: body.description,
			priority: body.priority as SupportTicket["priority"],
			status: "open",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		return HttpResponse.json({ status: "success", data: ticket });
	}),

	// Onboarding Progress
	http.get("/api/help/onboarding", async () => {
		await delay(200);
		return HttpResponse.json({ status: "success", data: onboardingProgress });
	}),

	// Dismiss Onboarding
	http.post("/api/help/onboarding/dismiss", async () => {
		await delay(200);
		onboardingProgress = { ...onboardingProgress, isDismissed: true };
		return HttpResponse.json({ status: "success", data: onboardingProgress });
	}),

	// System Status
	http.get("/api/help/status", async () => {
		await delay(100);
		return HttpResponse.json({ status: "success", data: systemStatus });
	}),
];

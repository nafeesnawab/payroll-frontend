import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
	BookOpen,
	Calendar,
	DollarSign,
	HelpCircle,
	MessageSquare,
	Rocket,
	Search,
	Settings,
	Shield,
	Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import type { HelpArticle, HelpCategory } from "@/types/help";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
	getting_started: <Rocket className="h-6 w-6" />,
	payroll: <DollarSign className="h-6 w-6" />,
	employees: <Users className="h-6 w-6" />,
	leave: <Calendar className="h-6 w-6" />,
	compliance: <Shield className="h-6 w-6" />,
	settings: <Settings className="h-6 w-6" />,
	troubleshooting: <HelpCircle className="h-6 w-6" />,
};

export default function HelpCenterPage() {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");

	const { data: categories, isLoading: loadingCategories } = useQuery({
		queryKey: ["help-categories"],
		queryFn: async () => {
			const response = await axios.get("/api/help/categories");
			return response.data.data as HelpCategory[];
		},
	});

	const { data: popularArticles, isLoading: loadingArticles } = useQuery({
		queryKey: ["help-popular"],
		queryFn: async () => {
			const response = await axios.get("/api/help/articles?popular=true");
			return response.data.data as HelpArticle[];
		},
	});

	const { data: searchResults } = useQuery({
		queryKey: ["help-search", searchTerm],
		queryFn: async () => {
			const response = await axios.get(`/api/help/articles?search=${searchTerm}`);
			return response.data.data as HelpArticle[];
		},
		enabled: searchTerm.length > 2,
	});

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchTerm.length > 2) {
			navigate(`/help/articles?search=${encodeURIComponent(searchTerm)}`);
		}
	};

	if (loadingCategories) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-12 w-full" />
				<div className="grid gap-4 md:grid-cols-3">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<Skeleton key={i} className="h-32" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="text-center max-w-2xl mx-auto">
				<h1 className="text-3xl font-bold flex items-center justify-center gap-2">
					<BookOpen className="h-8 w-8" />
					Help Center
				</h1>
				<p className="text-muted-foreground mt-2">Find answers, guides, and support for PayPilot</p>
			</div>

			{/* Search */}
			<form onSubmit={handleSearch} className="max-w-xl mx-auto">
				<div className="relative">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
					<Input
						placeholder="Search for help articles..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-12 h-12 text-lg"
					/>
				</div>
				{searchResults && searchResults.length > 0 && searchTerm.length > 2 && (
					<Card className="mt-2 absolute z-10 w-full max-w-xl">
						<CardContent className="p-2">
							{searchResults.slice(0, 5).map((article) => (
								<button
									key={article.id}
									type="button"
									className="w-full text-left p-3 hover:bg-muted rounded-lg"
									onClick={() => navigate(`/help/articles/${article.slug}`)}
								>
									<p className="font-medium">{article.title}</p>
									<p className="text-xs text-muted-foreground">{article.categoryLabel}</p>
								</button>
							))}
						</CardContent>
					</Card>
				)}
			</form>

			{/* Categories */}
			<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
				{categories?.map((category) => (
					<Card
						key={category.id}
						className="cursor-pointer hover:shadow-md transition-shadow"
						onClick={() => navigate(`/help/articles?category=${category.slug}`)}
					>
						<CardHeader className="pb-2">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-primary/10 rounded-lg text-primary">
									{CATEGORY_ICONS[category.slug] || <HelpCircle className="h-6 w-6" />}
								</div>
								<div>
									<CardTitle className="text-base">{category.name}</CardTitle>
									<CardDescription className="text-xs">{category.articleCount} articles</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">{category.description}</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Popular Articles */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Popular Articles</CardTitle>
					<CardDescription>Most viewed help articles</CardDescription>
				</CardHeader>
				<CardContent>
					{loadingArticles ? (
						<Skeleton className="h-48" />
					) : (
						<div className="space-y-3">
							{popularArticles?.map((article) => (
								<button
									key={article.id}
									type="button"
									className="w-full text-left p-4 border rounded-lg hover:bg-muted/50 transition-colors"
									onClick={() => navigate(`/help/articles/${article.slug}`)}
								>
									<div className="flex items-start justify-between">
										<div>
											<p className="font-medium">{article.title}</p>
											<p className="text-sm text-muted-foreground mt-1">{article.excerpt}</p>
										</div>
										<Badge variant="outline">{article.categoryLabel}</Badge>
									</div>
								</button>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Quick Actions */}
			<div className="grid gap-4 md:grid-cols-2">
				<Button variant="outline" className="h-auto py-6 justify-start" onClick={() => navigate("/help/contact")}>
					<MessageSquare className="h-6 w-6 mr-4" />
					<div className="text-left">
						<p className="font-medium">Contact Support</p>
						<p className="text-sm text-muted-foreground">Submit a ticket or email our team</p>
					</div>
				</Button>
				<Button
					variant="outline"
					className="h-auto py-6 justify-start"
					onClick={() => navigate("/help/articles?category=getting_started")}
				>
					<Rocket className="h-6 w-6 mr-4" />
					<div className="text-left">
						<p className="font-medium">Getting Started Guide</p>
						<p className="text-sm text-muted-foreground">Set up your payroll in minutes</p>
					</div>
				</Button>
			</div>
		</div>
	);
}

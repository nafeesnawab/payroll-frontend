import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, BookOpen, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { HelpArticle } from "@/types/help";
import { CATEGORY_LABELS } from "@/types/help";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";

export default function HelpArticlesPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const initialCategory = searchParams.get("category") || "";
	const initialSearch = searchParams.get("search") || "";

	const [searchTerm, setSearchTerm] = useState(initialSearch);
	const [categoryFilter, setCategoryFilter] = useState(initialCategory);

	const { data: articles, isLoading } = useQuery({
		queryKey: ["help-articles", categoryFilter, searchTerm],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (categoryFilter) params.append("category", categoryFilter);
			if (searchTerm) params.append("search", searchTerm);
			const response = await axios.get(`/api/help/articles?${params.toString()}`);
			return response.data.data as HelpArticle[];
		},
	});

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-96" />
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => navigate("/help")}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<BookOpen className="h-6 w-6" />
						Help Articles
					</h1>
					<p className="text-muted-foreground">Browse all help documentation</p>
				</div>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-wrap gap-4">
						<div className="flex-1 min-w-[200px]">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search articles..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-9"
								/>
							</div>
						</div>
						<div className="w-48">
							<Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v === "all" ? "" : v)}>
								<SelectTrigger>
									<SelectValue placeholder="All Categories" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Categories</SelectItem>
									{Object.entries(CATEGORY_LABELS).map(([key, label]) => (
										<SelectItem key={key} value={key}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Articles */}
			<Card>
				<CardHeader>
					<CardTitle>Articles</CardTitle>
					<CardDescription>{articles?.length || 0} articles found</CardDescription>
				</CardHeader>
				<CardContent>
					{articles && articles.length > 0 ? (
						<div className="space-y-3">
							{articles.map((article) => (
								<button
									key={article.id}
									type="button"
									className="w-full text-left p-4 border rounded-lg hover:bg-muted/50 transition-colors"
									onClick={() => navigate(`/help/articles/${article.slug}`)}
								>
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1">
											<p className="font-medium">{article.title}</p>
											<p className="text-sm text-muted-foreground mt-1 line-clamp-2">{article.excerpt}</p>
											<p className="text-xs text-muted-foreground mt-2">
												Updated {new Date(article.updatedAt).toLocaleDateString()}
											</p>
										</div>
										<div className="flex flex-col items-end gap-2">
											<Badge variant="outline">{article.categoryLabel}</Badge>
											{article.isPopular && <Badge className="bg-amber-100 text-amber-800">Popular</Badge>}
										</div>
									</div>
								</button>
							))}
						</div>
					) : (
						<p className="text-muted-foreground text-center py-8">No articles found matching your criteria</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Download, FileText, FileBadge, FileCheck, File } from "lucide-react";
import type { ESSDocument } from "@/types/ess";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

const documentTypeIcons: Record<ESSDocument["type"], React.ElementType> = {
	irp5: FileBadge,
	it3a: FileBadge,
	employment_letter: FileCheck,
	payslip: FileText,
	other: File,
};

const documentTypeLabels: Record<ESSDocument["type"], string> = {
	irp5: "IRP5 Tax Certificate",
	it3a: "IT3(a) Certificate",
	employment_letter: "Employment Letter",
	payslip: "Payslip",
	other: "Other Document",
};

export default function ESSDocumentsPage() {
	const { data: documents, isLoading } = useQuery({
		queryKey: ["ess-documents"],
		queryFn: async () => {
			const response = await axios.get("/api/ess/documents");
			return response.data.data as ESSDocument[];
		},
	});

	const handleDownload = (doc: ESSDocument) => {
		window.open(doc.downloadUrl, "_blank");
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-96" />
			</div>
		);
	}

	const taxDocuments = documents?.filter((d) => d.type === "irp5" || d.type === "it3a") || [];
	const employmentDocuments = documents?.filter((d) => d.type === "employment_letter") || [];
	const otherDocuments = documents?.filter((d) => d.type === "other" || d.type === "payslip") || [];

	const DocumentList = ({ docs }: { docs: ESSDocument[] }) => {
		if (docs.length === 0) {
			return (
				<div className="text-center py-12 text-muted-foreground">
					<FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
					<p>No documents available</p>
				</div>
			);
		}

		return (
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{docs.map((doc) => {
					const Icon = documentTypeIcons[doc.type];
					return (
						<Card key={doc.id} className="hover:shadow-md transition-shadow">
							<CardContent className="p-4">
								<div className="flex items-start gap-3">
									<div className="p-2 rounded-lg bg-primary/10">
										<Icon className="h-6 w-6 text-primary" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-medium truncate">{doc.name}</p>
										<p className="text-sm text-muted-foreground">
											{documentTypeLabels[doc.type]}
										</p>
										{doc.taxYear && (
											<Badge variant="outline" className="mt-1">
												Tax Year: {doc.taxYear}
											</Badge>
										)}
										{doc.description && (
											<p className="text-xs text-muted-foreground mt-1 line-clamp-2">
												{doc.description}
											</p>
										)}
										<p className="text-xs text-muted-foreground mt-2">
											Released: {new Date(doc.releasedAt).toLocaleDateString()}
										</p>
									</div>
								</div>
								<Button
									variant="outline"
									size="sm"
									className="w-full mt-4"
									onClick={() => handleDownload(doc)}
								>
									<Download className="h-4 w-4 mr-2" />
									Download
								</Button>
							</CardContent>
						</Card>
					);
				})}
			</div>
		);
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<FileText className="h-6 w-6" />
					My Documents
				</h1>
				<p className="text-muted-foreground">Access your tax certificates and employment documents</p>
			</div>

			<Tabs defaultValue="tax">
				<TabsList>
					<TabsTrigger value="tax">
						Tax Certificates
						{taxDocuments.length > 0 && (
							<Badge variant="secondary" className="ml-2">
								{taxDocuments.length}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="employment">
						Employment Letters
						{employmentDocuments.length > 0 && (
							<Badge variant="secondary" className="ml-2">
								{employmentDocuments.length}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="other">
						Other Documents
						{otherDocuments.length > 0 && (
							<Badge variant="secondary" className="ml-2">
								{otherDocuments.length}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="tax" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Tax Certificates</CardTitle>
							<CardDescription>
								IRP5 and IT3(a) certificates for tax filing purposes
							</CardDescription>
						</CardHeader>
						<CardContent>
							<DocumentList docs={taxDocuments} />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="employment" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Employment Letters</CardTitle>
							<CardDescription>
								Official employment confirmation and reference letters
							</CardDescription>
						</CardHeader>
						<CardContent>
							<DocumentList docs={employmentDocuments} />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="other" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Other Documents</CardTitle>
							<CardDescription>
								Additional documents shared with you
							</CardDescription>
						</CardHeader>
						<CardContent>
							<DocumentList docs={otherDocuments} />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}

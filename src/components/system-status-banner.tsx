import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import type { SystemStatusInfo } from "@/types/help";
import { Alert, AlertDescription } from "@/ui/alert";

export function SystemStatusBanner() {
	const { data: status } = useQuery({
		queryKey: ["system-status"],
		queryFn: async () => {
			const response = await axios.get("/api/help/status");
			return response.data.data as SystemStatusInfo;
		},
		refetchInterval: 60000,
	});

	if (!status || status.status === "operational") {
		return null;
	}

	const getStatusIcon = () => {
		switch (status.status) {
			case "degraded":
				return <AlertTriangle className="h-4 w-4" />;
			case "outage":
				return <XCircle className="h-4 w-4" />;
			case "maintenance":
				return <Info className="h-4 w-4" />;
			default:
				return <CheckCircle className="h-4 w-4" />;
		}
	};

	const getVariant = () => {
		switch (status.status) {
			case "outage":
				return "destructive" as const;
			default:
				return "default" as const;
		}
	};

	const getBgClass = () => {
		switch (status.status) {
			case "degraded":
				return "bg-amber-50 border-amber-200 text-amber-800";
			case "outage":
				return "bg-red-50 border-red-200 text-red-800";
			case "maintenance":
				return "bg-blue-50 border-blue-200 text-blue-800";
			default:
				return "";
		}
	};

	return (
		<Alert variant={getVariant()} className={getBgClass()}>
			{getStatusIcon()}
			<AlertDescription className="flex items-center justify-between">
				<span>{status.message}</span>
				{status.maintenanceScheduled && (
					<span className="text-xs">
						Scheduled: {new Date(status.maintenanceScheduled.startTime).toLocaleString()}
					</span>
				)}
			</AlertDescription>
		</Alert>
	);
}

import { Icon } from "@/components/icon";
import type { NavProps } from "@/components/nav";

export const frontendNavData: NavProps["data"] = [
	{
		name: "Overview",
		items: [
			{
				title: "Dashboard",
				path: "/dashboard",
				icon: <Icon icon="mdi:view-dashboard" size="24" />,
			},
		],
	},
	{
		name: "Payroll",
		items: [
			{
				title: "Employees",
				path: "/employees",
				icon: <Icon icon="mdi:account-group" size="24" />,
			},
			{
				title: "Payroll",
				path: "/payroll",
				icon: <Icon icon="mdi:cash-multiple" size="24" />,
			},
			{
				title: "Leave",
				path: "/leave",
				icon: <Icon icon="mdi:calendar-clock" size="24" />,
			},
		],
	},
	{
		name: "Compliance",
		items: [
			{
				title: "Reports & Filings",
				path: "/reports",
				icon: <Icon icon="mdi:file-document-outline" size="24" />,
			},
		],
	},
	{
		name: "Configuration",
		items: [
			{
				title: "Settings",
				path: "/settings",
				icon: <Icon icon="mdi:cog" size="24" />,
				children: [
					{
						title: "Employer Details",
						path: "/settings/employer",
					},
					{
						title: "Bank & EFT",
						path: "/settings/bank",
					},
					{
						title: "Pay Frequencies",
						path: "/settings/pay-frequencies",
					},
				],
			},
		],
	},
];

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
			{
				title: "Terminations",
				path: "/terminations",
				icon: <Icon icon="mdi:account-off" size="24" />,
			},
		],
	},
	{
		name: "Compliance",
		items: [
			{
				title: "Filings",
				path: "/filings",
				icon: <Icon icon="mdi:file-document-check" size="24" />,
			},
			{
				title: "Reports",
				path: "/reports",
				icon: <Icon icon="mdi:chart-box" size="24" />,
			},
			{
				title: "Calendar",
				path: "/calendar",
				icon: <Icon icon="mdi:calendar" size="24" />,
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
						title: "Banking & EFT",
						path: "/settings/banking",
					},
					{
						title: "Pay Frequencies",
						path: "/settings/pay-frequencies",
					},
					{
						title: "Leave Types",
						path: "/settings/leave",
					},
					{
						title: "Payroll Items",
						path: "/settings/payroll-items",
					},
				],
			},
			{
				title: "Notifications",
				path: "/notifications",
				icon: <Icon icon="mdi:bell" size="24" />,
			},
			{
				title: "Data Operations",
				path: "/data",
				icon: <Icon icon="mdi:database" size="24" />,
			},
		],
	},
	{
		name: "Help",
		items: [
			{
				title: "Help Center",
				path: "/help",
				icon: <Icon icon="mdi:help-circle" size="24" />,
			},
		],
	},
];

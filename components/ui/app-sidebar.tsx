"use client";

import type * as React from "react";
import {
	Calendar1,
	CameraIcon,
	ClipboardListIcon,
	CreditCardIcon,
	FileCodeIcon,
	FileTextIcon,
	HelpCircleIcon,
	LayoutDashboardIcon,
	SettingsIcon,
	TargetIcon,
	Users,
} from "lucide-react";

import { NavDocuments } from "@/components/ui/nav-documents";
import { NavMain } from "@/components/ui/nav-main";
import { NavSecondary } from "@/components/ui/nav-secondary";
import { NavUser } from "@/components/ui/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Dashboard",
			url: "/",
			icon: LayoutDashboardIcon,
		},
		{
			title: "Clients",
			url: "/clients",
			icon: Users,
		},
		{
			title: "Sessions",
			url: "/session-logs",
			icon: Calendar1,
		},
		{
			title: "Goals",
			url: "/goals",
			icon: TargetIcon,
		},
	],
	navClouds: [
		{
			title: "Capture",
			icon: CameraIcon,
			isActive: true,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
		{
			title: "Proposal",
			icon: FileTextIcon,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
		{
			title: "Prompts",
			icon: FileCodeIcon,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
	],
	navSecondary: [
		{
			title: "Settings",
			url: "/settings",
			icon: SettingsIcon,
		},
		{
			title: "Get Help",
			url: "/help",
			icon: HelpCircleIcon,
		},
	],
	documents: [
		{
			name: "Subscriptions",
			url: "#",
			icon: CreditCardIcon,
		},
		{
			name: "Reports",
			url: "#",
			icon: ClipboardListIcon,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<a href="/">
								<span className="text-base font-semibold">Acme Inc.</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
				<Separator orientation="horizontal" className="mx-1" />
			</SidebarHeader>

			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavDocuments items={data.documents} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<Separator orientation="horizontal" className="mx-1" />
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}

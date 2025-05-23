"use client";

import {
	Calendar1,
	CameraIcon,
	ClipboardIcon,
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
import type * as React from "react";

import { NavManage } from "@/components/ui/nav/nav-manage";
import { NavMain } from "@/components/ui/nav/nav-main";
import { NavSecondary } from "@/components/ui/nav/nav-secondary";
import { NavUser } from "@/components/ui/nav/nav-user";
import { Separator } from "@/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavAthletes } from "./nav/nav-athletes";
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
			title: "Athletes",
			url: "/athletes",
			icon: Users,
		},
		{
			title: "Training Plans",
			url: "/training-plans",
			icon: FileTextIcon,
		},
		{
			title: "Goals",
			url: "/goals",
			icon: TargetIcon,
		},
		{
			title: "Sessions",
			url: "/session-logs",
			icon: Calendar1,
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
			title: "Assistants",
			url: "/assistants",
			icon: ClipboardIcon,
		},
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

			<SidebarContent className="flex flex-col justify-between gap-2">
				<div className="flex flex-col">
					<NavMain items={data.navMain} />
					<NavAthletes />
				</div>
				<div className="flex flex-col">
					<NavManage items={data.documents} />
					<NavSecondary items={data.navSecondary} />
				</div>
			</SidebarContent>
			<SidebarFooter>
				<Separator orientation="horizontal" className="mx-1" />
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}

"use client";

import {
	Calendar1,
	ClipboardIcon,
	FileTextIcon,
	HelpCircleIcon,
	LayoutDashboardIcon,
	SettingsIcon,
	TargetIcon,
	Users,
} from "lucide-react";
import type * as React from "react";

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
import { NavGroup } from "./nav/nav-group";
const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Your Coaching Day",
			url: "/",
			icon: LayoutDashboardIcon,
		},
		{
			title: "My Athletes",
			url: "/athletes",
			icon: Users,
		},
		{
			title: "Today's Focus",
			url: "/training-plans",
			icon: FileTextIcon,
		},
		{
			title: "Goals & Progress",
			url: "/goals",
			icon: TargetIcon,
		},
		{
			title: "Session Logs",
			url: "/session-logs",
			icon: Calendar1,
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
								<span className="text-base font-semibold">CoachCraft</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<Separator orientation="horizontal" />
			<SidebarContent>
				<NavGroup items={data.navMain} />
				<NavAthletes />
			</SidebarContent>
			<Separator orientation="horizontal" />
			<SidebarContent>
				<NavGroup items={data.navSecondary} />
				<NavGroup items={data.documents} />
			</SidebarContent>
			<Separator orientation="horizontal" />
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}

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
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";

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
	documents: [],
};

export default () => {
	const pathname = usePathname();

	return (<div className="flex flex-row justify-between items-center">
		<div>Logo</div>
		<div className="shadow-sm rounded-4xl m-4 p-2 flex flex-row items-center justify-around bg-white gap-4 max-w-[80%]">
			{data.navMain.map((item) => {
				const isActive = pathname === item.url;
				return (
					<Link
						key={item.title}
						href={item.url}
						className=" text-sm flex flex-row gap-2 items-center justify-center px-4 py-2 rounded-4xl text-muted-foreground hover:bg-black"
					>
						<item.icon className="block w-5 h-5" />
						<span>{item.title}</span>
					</Link>

				);
			})}
		</div>
		<div>User</div>
	</div>
	);
};

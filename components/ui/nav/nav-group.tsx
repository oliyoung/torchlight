import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export interface NavItem {
	title: string;
	url: string;
	icon?: LucideIcon;
}

export interface NavGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	items: NavItem[];
	label?: string;
	useNextLink?: boolean;
	renderAction?: (item: NavItem) => ReactNode;
	renderContent?: (item: NavItem) => ReactNode;
	contentClassName?: string;
	useGroupContent?: boolean;
}

export function NavGroup({
	items,
	label,
	useNextLink = true,
	renderAction,
	renderContent,
	contentClassName,
	useGroupContent = true,
	...props
}: NavGroupProps) {
	const LinkComponent = useNextLink ? Link : "a";

	const menuItems = items.map((item) => (
		<SidebarMenuItem key={item.title}>
			<SidebarMenuButton asChild>
				<LinkComponent href={item.url}>
					{item.icon && <item.icon />}
					{renderContent ? renderContent(item) : <span>{item.title}</span>}
				</LinkComponent>
			</SidebarMenuButton>
			{renderAction && (
				<SidebarMenuAction>
					{renderAction(item)}
				</SidebarMenuAction>
			)}
		</SidebarMenuItem>
	));

	return (
		<SidebarGroup {...props}>
			{label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
			{useGroupContent ? (
				<SidebarGroupContent className={contentClassName}>
					<SidebarMenu>
						{menuItems}
					</SidebarMenu>
				</SidebarGroupContent>
			) : (
				<SidebarMenu>
					{menuItems}
				</SidebarMenu>
			)}
		</SidebarGroup>
	);
}
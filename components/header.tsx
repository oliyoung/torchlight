import React from "react";
import { Search } from "@/components/ui/search-input";
import { Menu } from "@/components/ui/menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
const Header = () => {
	return (
		<header className="p-4 border-b border-slate-200 flex items-center justify-between">
			<Search />
			<Separator
				orientation="vertical"
				className="mx-2 data-[orientation=vertical]:h-4"
			/>
			<Menu />
		</header>
	);
};

export default Header;

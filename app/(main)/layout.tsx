"use client";

import Navigation, { SidebarProvider, MobileMenuButton, useSidebar } from "@/components/ui/navigation";

function MainContent({ children }: { children: React.ReactNode }) {
	const { isCollapsed } = useSidebar();

	return (
		<main className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
				{children}
		</main>
	);
}

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<div className="min-h-screen bg-background">
				<Navigation />
				<MobileMenuButton />
				<MainContent>{children}</MainContent>
			</div>
		</SidebarProvider>
	);
}
"use client";

import Navigation, { SidebarProvider, MobileMenuButton, useSidebar } from "@/components/ui/navigation";
import { useSessionGuard } from "@/lib/hooks/use-session-guard";

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
	// Enable automatic session monitoring for all main app pages
	useSessionGuard({
		checkInterval: 60000, // Check every minute
		autoRedirect: true
	});

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
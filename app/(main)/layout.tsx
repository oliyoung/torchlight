"use client";

import Navigation, { SidebarProvider, MobileMenuButton, useSidebar } from "@/components/ui/navigation";
import { useSessionGuard } from "@/lib/hooks/use-session-guard";
import { CoachRoleProvider } from "@/lib/contexts/coach-role-context";
import { useCoachProfile } from "@/lib/hooks/use-coach-profile";

function MainContentWithRole({ children }: { children: React.ReactNode }) {
	const { coach, loading } = useCoachProfile();
	const { isCollapsed } = useSidebar();

	return (
		<CoachRoleProvider coach={coach} isLoading={loading}>
			<main className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
				{children}
			</main>
		</CoachRoleProvider>
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
			<Navigation />
			<MobileMenuButton />
			<MainContentWithRole>{children}</MainContentWithRole>
		</SidebarProvider>
	);
}
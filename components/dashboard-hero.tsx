"use client";

import { Button } from "@/components/ui/button";

export function DashboardHero() {
	return (
		<section className="space-y-6 flex gap-4">
			<Button variant="default">Log New Session</Button>
			<Button variant="secondary">View Training Plans</Button>
			<Button variant="secondary">Get AI Coaching Tips</Button>
		</section>
	);
}

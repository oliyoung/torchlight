"use client";

import { Suspense } from "react";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import AthletesViewAdapter from "@/components/athletes-view-adapter";
import { useCoachRoleInfo } from "@/lib/contexts/coach-role-context";

export default function Page() {
	const { displayConfig, isProfessional } = useCoachRoleInfo();
	
	return (
		<PageWrapper
			title={isProfessional ? "Athletes" : displayConfig?.displayName || "Athletes"}
			description={isProfessional ? "Manage and view all your athletes" : "Manage your training"}
			breadcrumbs={[{ label: "Athletes", href: "/athletes" }]}
			actions={
				isProfessional ? (
					<Button asChild>
						<Link href="/athletes/new">
							<PlusIcon className="w-4 h-4 mr-2" />
							Add Athlete
						</Link>
					</Button>
				) : undefined
			}
		>
			<Suspense fallback={<div className="p-4">Loading...</div>}>
				<AthletesViewAdapter />
			</Suspense>
		</PageWrapper>
	);
}

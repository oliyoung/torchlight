import { Suspense } from "react";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import AthletesClient from "./AthletesClient";

export default function Page() {
	return (
		<PageWrapper
			title="Athletes"
			description="Manage and view all your athletes"
			breadcrumbs={[{ label: "Athletes", href: "/athletes" }]}
			actions={
				<Button asChild>
					<Link href="/athletes/new">
						<PlusIcon className="w-4 h-4 mr-2" />
						Add Athlete
					</Link>
				</Button>
			}
		>
			<Suspense fallback={<div className="p-4">Loading athletes...</div>}>
				<AthletesClient />
			</Suspense>
		</PageWrapper>
	);
}

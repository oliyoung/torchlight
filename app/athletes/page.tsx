"use client";

import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { PageCard, PageGrid, PageWrapper } from "@/components/ui/page-wrapper";
import type { Athlete } from "@/lib/types";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useQuery } from "urql";

const AthletesQuery = `
	query {
		athletes {
			id
			sport
			firstName
			lastName
			email
		}
	}
`;

function AthletesList() {
	const [{ data, fetching, error }] = useQuery<{ athletes: Athlete[] }>({
		query: AthletesQuery,
	});

	if (fetching) return <div className="p-4">Loading athletes...</div>;
	if (error)
		return (
			<ErrorMessage message={`Error loading athletes: ${error.message}`} />
		);

	return (
		<PageGrid columns={4}>
			{data?.athletes?.map((athlete) => (
				<PageCard
					key={athlete.id}
					href={`/athletes/${athlete.id}`}
					title={`${athlete.firstName} ${athlete.lastName}`}
					subtitle={athlete.sport}
				>&nbsp;</PageCard>
			))
			}
		</PageGrid >
	);
}

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
			<AthletesList />
		</PageWrapper>
	);
}

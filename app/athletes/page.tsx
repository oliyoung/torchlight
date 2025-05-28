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
					className="hover:shadow-md transition-shadow"
				>
					<Link href={`/athletes/${athlete.id}`} className="block">
						<h3 className="font-epilogue text-lg font-medium">
							{athlete.firstName} {athlete.lastName}
						</h3>
						<p className="text-sm text-muted-foreground mt-1">
							{athlete.sport}
						</p>
					</Link>
				</PageCard>
			))}
		</PageGrid>
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

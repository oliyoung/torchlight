"use client";
import Breadcrumbs from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { Heading } from "@/components/ui/heading";
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
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
			{data?.athletes?.map((athlete) => (
				<div
					key={athlete.id}
					className="border rounded px-3 py-2"
				>
					<Link
						href={`/athletes/${athlete.id}`}
						className="font-epilogue text-lg"
					>
						{athlete.firstName} {athlete.lastName}
					</Link>
					<p className="text-xs text-muted-foreground">{athlete.sport}</p>
				</div>
			))}
		</div>
	);
}

export default function AthleteListPage() {
	return (
		<div className="p-6 flex flex-col gap-4">
			<Breadcrumbs breadcrumbs={[{ label: "Athletes", href: "/athletes" }]} />
			<div className="flex flex-row justify-between">
				<Heading>Athletes</Heading>
				<Button asChild accessKey="a">
					<Link href="/athletes/new">
						<PlusIcon className="w-4 h-4" />
						Add Athlete
					</Link>
				</Button>
			</div>
			<AthletesList />
		</div>
	);
}

"use client";

import { Card } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import Link from "next/link";
import type * as React from "react";
import { useQuery } from "urql";

const LastAthletesQuery = `
	query LastAthletes {
		athletes {
			id
			firstName
			lastName
			updatedAt
		}
	}
`;

const LastAthletes: React.FC = () => {
	const [{ data, fetching, error }] = useQuery({ query: LastAthletesQuery });

	const lastAthletes = data?.athletes
		? [...data.athletes]
				.sort(
					(a, b) =>
						new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
				)
				.slice(0, 5)
		: [];

	return (
		<Card className="p-4">
			<h2 className="text-lg font-bold mb-2">Last 5 Updated Athletes</h2>
			{fetching ? (
				<div>Loading athletes...</div>
			) : error ? (
				<ErrorMessage message={error.message} />
			) : (
				<ul className="space-y-2">
					{lastAthletes.map((athlete) => (
						<li key={athlete.id}>
							<Link
								href={`/athletes/${athlete.id}`}
								className="text-primary underline"
							>
								{athlete.firstName} {athlete.lastName}
							</Link>
							<span className="ml-2 text-xs text-muted-foreground">
								(Updated: {new Date(athlete.updatedAt).toLocaleString()})
							</span>
						</li>
					))}
				</ul>
			)}
		</Card>
	);
};

export default LastAthletes;

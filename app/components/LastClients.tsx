"use client";

import type * as React from "react";
import { useQuery } from "urql";
import Link from "next/link";
import { ErrorMessage } from "@/components/ui/error-message";
import { Card } from "@/components/ui/card";

const LastClientsQuery = `
	query LastClients {
		clients {
			id
			firstName
			lastName
			updatedAt
		}
	}
`;

const LastClients: React.FC = () => {
	const [{ data, fetching, error }] = useQuery({ query: LastClientsQuery });

	const lastClients = data?.clients
		? [...data.clients]
				.sort(
					(a, b) =>
						new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
				)
				.slice(0, 5)
		: [];

	return (
		<Card className="p-4">
			<h2 className="text-lg font-bold mb-2">Last 5 Updated Clients</h2>
			{fetching ? (
				<div>Loading clients...</div>
			) : error ? (
				<ErrorMessage message={error.message} />
			) : (
				<ul className="space-y-2">
					{lastClients.map((client) => (
						<li key={client.id}>
							<Link
								href={`/clients/${client.id}`}
								className="text-primary underline"
							>
								{client.firstName} {client.lastName}
							</Link>
							<span className="ml-2 text-xs text-muted-foreground">
								(Updated: {new Date(client.updatedAt).toLocaleString()})
							</span>
						</li>
					))}
				</ul>
			)}
		</Card>
	);
};

export default LastClients;

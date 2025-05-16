"use client";
import React from "react";
import { useQuery } from "urql";
import Breadcrumbs from "@/components/breadcrumbs";
import { Heading } from "@/components/ui/heading";
import type { Client } from "@/lib/types";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
const ClientsQuery = `
	query {
		clients {
			id
			firstName
			lastName
			email
		}
	}
`;

function ClientsList() {
	const [{ data, fetching, error }] = useQuery<{ clients: Client[] }>({
		query: ClientsQuery,
	});

	if (fetching) return <div className="p-4">Loading clients...</div>;
	if (error)
		return <ErrorMessage message={`Error loading clients: ${error.message}`} />;

	return (
		<ul className="mt-4 space-y-2">
			{data?.clients?.map((client) => (
				<li key={client.id} className="border rounded px-3 py-2">
					<Link href={`/clients/${client.id}`}>
						{client.firstName} {client.lastName}{" "}
						<span className="text-xs text-muted-foreground">
							({client.email})
						</span>
					</Link>
				</li>
			))}
		</ul>
	);
}

export default function ClientListPage() {
	return (
		<>
			<Breadcrumbs />
			<Heading>Clients</Heading>
			<Button asChild accessKey="a" variant={"default"}>
				<Link href="/clients/new">
					<PlusIcon className="w-4 h-4" />
					Add Client
				</Link>
			</Button>
			<ClientsList />
		</>
	);
}

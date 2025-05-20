"use client";
import Breadcrumbs from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { Heading } from "@/components/ui/heading";
import type { Client } from "@/lib/types";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useQuery } from "urql";
const ClientsQuery = `
	query {
		clients {
			id
			sport
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
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
			{data?.clients?.map((client) => (
				<div
					key={client.id}
					className="border rounded px-3 py-2 bg-white shadow-sm"
				>
					<Link
						href={`/clients/${client.id}`}
						className="font-semibold text-lg"
					>
						{client.firstName} {client.lastName}
					</Link>
					<p className="text-xs text-muted-foreground">{client.sport}</p>
				</div>
			))}
		</div>
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

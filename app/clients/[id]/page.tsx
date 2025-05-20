"use client";
import type * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "urql";
import { ErrorMessage } from "@/components/ui/error-message";
import { Card } from "@/components/ui/card";
import Breadcrumbs from "@/components/breadcrumbs";
import { Heading } from "@/components/ui/heading";

const ClientQuery = `
	query Client($id: ID!) {
		client(id: $id) {
			id
			userId
			firstName
			lastName
			birthday
			gender
			fitnessLevel
			trainingHistory
			height
			weight
			email
			tags
			notes
			createdAt
			updatedAt
			deletedAt
			trainingPlans {
				id
				title
				overview
				createdAt
				updatedAt
				deletedAt
			}
		}
	}
`;

const UserProfile: React.FC = () => {
	const params = useParams();
	const id = params.id as string;
	const [{ data, fetching, error }] = useQuery({
		query: ClientQuery,
		variables: { id },
		pause: !id,
	});

	if (fetching) return <div className="p-4">Loading client...</div>;
	if (error) return <ErrorMessage message={error.message} />;
	if (!data?.client) return <ErrorMessage message="Client not found" />;

	const client = data.client;

	return (
		<>
			<Breadcrumbs />
			<Heading>{`${client.firstName} ${client.lastName}`}</Heading>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<span className="font-semibold">Email:</span> {client.email}
				</div>
				<div>
					<span className="font-semibold">Birthday:</span> {client.birthday}
				</div>
				<div>
					<span className="font-semibold">Gender:</span> {client.gender || "-"}
				</div>
				<div>
					<span className="font-semibold">Fitness Level:</span>{" "}
					{client.fitnessLevel || "-"}
				</div>
				<div>
					<span className="font-semibold">Training History:</span>{" "}
					{client.trainingHistory || "-"}
				</div>
				<div>
					<span className="font-semibold">Height:</span>{" "}
					{client.height ? `${client.height} cm` : "-"}
				</div>
				<div>
					<span className="font-semibold">Weight:</span>{" "}
					{client.weight ? `${client.weight} kg` : "-"}
				</div>
				<div>
					<span className="font-semibold">Tags:</span>{" "}
					{client.tags && client.tags.length > 0 ? client.tags.join(", ") : "-"}
				</div>
				<div>
					<span className="font-semibold">Notes:</span> {client.notes || "-"}
				</div>
				<div>
					<span className="font-semibold">Created At:</span> {client.createdAt}
				</div>
				<div>
					<span className="font-semibold">Updated At:</span> {client.updatedAt}
				</div>
				<div>
					<span className="font-semibold">Deleted At:</span>{" "}
					{client.deletedAt || "-"}
				</div>
				<div>
					<span className="font-semibold">User ID:</span> {client.userId}
				</div>
				<div>
					<span className="font-semibold">Client ID:</span> {client.id}
				</div>
			</div>
		</>
	);
};

export default UserProfile;

import { notFound } from "next/navigation";
import { GraphQLClient, gql } from "graphql-request";
import React from "react";
import { Heading } from "@/components/ui/heading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import Breadcrumbs from "@/components/breadcrumbs";

const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3000/api/graphql";

const ATHLETE_QUERY = gql`
  query AthleteById($id: ID!) {
    athlete(id: $id) {
      id
      firstName
      lastName
      email
      sport
      fitnessLevel
      tags
    }
  }
`;

interface Athlete {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    sport: string;
    fitnessLevel: string;
    tags?: string[];
}

interface AthleteQueryResult {
    athlete: Athlete | null;
}

interface AthletePageProps {
    params: { id: string };
}

export default async function AthletePage({ params }: AthletePageProps) {
    const { id } = await params;
    const client = new GraphQLClient(endpoint);
    let athlete: Athlete | null = null;
    try {
        const data = await client.request<AthleteQueryResult>(ATHLETE_QUERY, { id });
        athlete = data.athlete;
    } catch (e) {
        // Optionally log error
    }
    if (!athlete) return notFound();

    return (
        <>
            <Breadcrumbs />
            <Heading>{athlete.firstName} {athlete.lastName.toLocaleUpperCase()}</Heading>
            <p className="text-gray-600 mb-1">Email: <span className="text-black dark:text-white">{athlete.email}</span></p>
            <p className="text-gray-600 mb-1">Sport: <span className="text-black dark:text-white">{athlete.sport}</span></p>
            <p className="text-gray-600 mb-1">Fitness Level: <span className="text-black dark:text-white">{athlete.fitnessLevel}</span></p>
            <div className="mb-4">
                <span className="text-gray-600">Tags: </span>
                {athlete.tags?.map((tag: string) => (
                    <span key={tag} className="inline-block bg-zinc-200    dark:bg-zinc-700 text-xs rounded px-2 py-1 mr-2">{tag}</span>
                ))}
            </div>

            <section className="mt-8">
                <h2 className="text-2xl font-semibold mb-2">Goals</h2>
                {/* TODO: Replace with real goals list for this athlete */}
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded p-4 text-zinc-500 dark:text-zinc-400">
                    Goals list coming soon...
                </div>
            </section>
        </>

    );
}
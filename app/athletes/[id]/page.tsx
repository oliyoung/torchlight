"use client";

import Breadcrumbs from "@/components/breadcrumbs";
import { ErrorMessage } from "@/components/ui/error-message";
import { Heading } from "@/components/ui/heading";
import { Loading } from "@/components/ui/loading";
import type { Athlete } from "@/lib/types";
import { gql } from "graphql-request";
import { notFound, useParams } from "next/navigation";
import type React from "react";
import { useQuery } from "urql";

const AthleteQuery = gql`
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

export default function Page() {
    const { id } = useParams();

    const [{ data, fetching, error }] = useQuery<{ athlete: Athlete; }>({ query: AthleteQuery, variables: { id }, pause: !id, });


    if (fetching) return <Loading />;
    if (error) return <ErrorMessage message={error.toString()} />
    if (!data?.athlete) return notFound();

    return (
        <>
            <Breadcrumbs />
            <Heading>
                {data.athlete.firstName} {data.athlete.lastName.toLocaleUpperCase()}
            </Heading>
            <p className="text-gray-600 mb-1">
                Email:{" "}
                <span className="text-black dark:text-white">{data.athlete.email}</span>
            </p>
            <p className="text-gray-600 mb-1">
                Sport:{" "}
                <span className="text-black dark:text-white">{data.athlete.sport}</span>
            </p>
            <p className="text-gray-600 mb-1">
                Fitness Level:{" "}
                <span className="text-black dark:text-white">
                    {data.athlete.fitnessLevel}
                </span>
            </p>
            <div className="mb-4">
                <span className="text-gray-600">Tags: </span>
                {data.athlete.tags?.map((tag: string) => (
                    <span
                        key={tag}
                        className="inline-block bg-zinc-200    dark:bg-zinc-700 text-xs rounded px-2 py-1 mr-2"
                    >
                        {tag}
                    </span>
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
};
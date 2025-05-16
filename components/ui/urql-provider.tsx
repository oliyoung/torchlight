"use client";
import type { ReactNode } from "react";
import { createClient, Provider, cacheExchange, fetchExchange } from "urql";

export const urqlClient = createClient({
	url: "/api/graphql",
	exchanges: [cacheExchange, fetchExchange],
});

interface UrqlProviderProps {
	children: ReactNode;
}

export function UrqlProvider({ children }: UrqlProviderProps) {
	return <Provider value={urqlClient}>{children}</Provider>;
}

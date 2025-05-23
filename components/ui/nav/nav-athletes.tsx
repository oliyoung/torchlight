import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Athlete } from "@/lib/types";
import Link from "next/link";
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


export function NavAthletes() {
    const [{ data, fetching, error }] = useQuery<{ athletes: Athlete[] }>({
        query: AthletesQuery,
    });

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Athletes</SidebarGroupLabel>
            <SidebarMenu>
                {data?.athletes.slice(0, 5).map((athlete) => (
                    <SidebarMenuItem key={athlete.id}>
                        <SidebarMenuButton asChild>
                            <Link href={`/athletes/${athlete.id}`}>
                                <span>{athlete.firstName} {athlete.lastName}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
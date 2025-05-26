import { DashboardHero } from "@/components/dashboard-hero";
import LastAthletes from "./components/LastAthletes";
import LastSessionLogs from "./components/LastSessionLogs";

export default function DashboardPage() {
	return (
		<div className="container p-8">
			<DashboardHero />
			<LastAthletes />
			<LastSessionLogs />
		</div>
	);
}

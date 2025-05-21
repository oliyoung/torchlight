import LastAthletes from "./components/LastAthletes";
import LastSessionLogs from "./components/LastSessionLogs";

export default function Home() {
	return (
		<>
			<h1>Dashboard</h1>
			<LastAthletes />
			<LastSessionLogs />
		</>
	);
}

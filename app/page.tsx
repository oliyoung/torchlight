import LastClients from "./components/LastClients";
import LastSessionLogs from "./components/LastSessionLogs";

export default function Home() {
	return (
		<>
			<h1>Dashboard</h1>
			<LastClients />
			<LastSessionLogs />
		</>
	);
}

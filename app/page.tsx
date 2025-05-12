import Image from "next/image";
import Navigation from "./components/Navigation";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LastClients from "./components/LastClients";
import LastSessionLogs from "./components/LastSessionLogs";

export default function Home() {
	return (
		<div className="grid grid-cols-[200px_1fr] min-h-screen">
			<Navigation />
			<div className="flex flex-col">
				<Header />
				<main className="flex-1 p-4">
					<LastClients />
					<LastSessionLogs />
				</main>
				<Footer />
			</div>
		</div>
	);
}

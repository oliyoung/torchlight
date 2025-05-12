import React from "react";
import { useRouter } from "next/router";

const ClientDetail = () => {
	const router = useRouter();
	const { id } = router.query;

	return (
		<div>
			<h1>Client Details</h1>
			<p>Details for client with ID: {id}</p>
			{/* Display client details here */}
		</div>
	);
};

export default ClientDetail;

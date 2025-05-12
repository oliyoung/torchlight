import React from "react";
import { useRouter } from "next/router";

const GoalDetail = () => {
	const router = useRouter();
	const { id } = router.query;

	return (
		<div>
			<h1>Goal Details</h1>
			<p>Details for goal with ID: {id}</p>
			{/* Display goal details here */}
		</div>
	);
};

export default GoalDetail;

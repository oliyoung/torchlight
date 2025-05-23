"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

const Auth = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSignUp = async () => {
		const {
			data: { user },
			error,
		} = await supabase.auth.signUp({
			email,
			password,
		});
		if (error) logger.error("Error signing up:", error.message);
		else logger.info("User signed up:", user);
	};

	const handleSignIn = async () => {
		const {
			data: { user },
			error,
		} = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) logger.error("Error signing in:", error.message);
		else logger.info("User signed in:", user);
	};

	return (
		<div className="flex justify-center items-center h-screen">
			<div className="max-w-md p-5 bg-white rounded-lg shadow-md">
				<h1 className="mb-5 text-xl font-bold">Sign up</h1>
				<input
					type="email"
					placeholder="user@company.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full p-2 mb-3 border rounded-md"
				/>
				<button
					type="button"
					onClick={handleSignUp}
					className="w-full p-2 mb-3 text-white bg-black rounded-md"
				>
					Continue with email
				</button>
				<div className="text-center my-4">or</div>
				<button
					type="button"
					className="w-full p-2 mb-3 bg-white border rounded-md flex items-center justify-center"
				>
					<img
						src="/path/to/google-icon.png"
						alt="Google"
						className="w-5 mr-2"
					/>
					Continue with Google
				</button>
				<p className="text-xs text-gray-600 mt-5">
					By clicking "Create account" above, you acknowledge that you will
					receive updates from the Relume team and that you have read,
					understood, and agreed to Relume Library's{" "}
					<a href="/terms" className="text-black">
						Terms & Conditions
					</a>
					,{" "}
					<a href="/privacy" className="text-black">
						Privacy Policy
					</a>
					.
				</p>
				<div className="text-center mt-5">
					Already have an account?{" "}
					<button
						type="button"
						onClick={handleSignIn}
						className="text-black underline"
					>
						Log in
					</button>
				</div>
			</div>
		</div>
	);
};

export default Auth;

import type { Metadata } from "next";
import { Inter, Source_Sans_3 } from "next/font/google";
import "@/app/globals.css";
import { AuthProvider } from "@/lib/auth/context";
import { UrqlProvider } from "@/lib/hooks/urql-provider";
import { OnboardingProvider } from "@/components/onboarding-provider";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: "swap",
});

const sourceSansPro = Source_Sans_3({
	variable: "--font-source-sans-pro",
	subsets: ["latin"],
	display: "swap",
	weight: ["400", "600"],
});

export const metadata: Metadata = {
	title: "wisegrowth",
	description: "AI-powered coaching platform for athlete development",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body className={`antialiased ${inter.className} ${sourceSansPro.className}`}>
				<AuthProvider>
					<UrqlProvider>
						<OnboardingProvider>
							{children}
						</OnboardingProvider>
					</UrqlProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
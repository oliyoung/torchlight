import { Inter, Source_Sans_3 } from "next/font/google";
import type React from "react";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

const sourceSansPro = Source_Sans_3({
    variable: "--font-source-sans-pro",
    subsets: ["latin"],
    display: "swap",
    weight: ["400", "600"], // Specify the weights you need
});

export default ({ children }: Readonly<{ children: React.ReactNode }>) => {
    return (
        <html lang="en">
            <body
                className={`antialiased ${inter.className} ${sourceSansPro.className}`}
            >
                dsadsad
                {children}
            </body>
        </html>
    );
};

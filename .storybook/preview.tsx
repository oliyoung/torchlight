import type { Preview } from '@storybook/nextjs-vite';
import React from 'react';
import { Inter, Source_Sans_3 } from 'next/font/google';
import '../app/globals.css';
import { AuthProvider } from '../lib/auth/context';
import { UrqlProvider } from '../lib/hooks/urql-provider';

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

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className={`antialiased ${inter.className} ${sourceSansPro.className}`}>
        <AuthProvider>
          <UrqlProvider>
            <Story />
          </UrqlProvider>
        </AuthProvider>
      </div>
    ),
  ],
};

export default preview;
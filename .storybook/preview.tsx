import type { Preview } from '@storybook/nextjs-vite';
import React from 'react';
import { Inter, Source_Sans_3 } from 'next/font/google';
import '../app/globals.css';
import { StorybookProviders } from './storybook-providers';

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
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/storybook',
        query: {},
      },
    },
  },
  decorators: [
    (Story) => (
      <div className={`antialiased ${inter.className} ${sourceSansPro.className}`}>
        <StorybookProviders>
          <Story />
        </StorybookProviders>
      </div>
    ),
  ],
};

export default preview;
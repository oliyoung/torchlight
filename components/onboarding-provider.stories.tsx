import type { Meta, StoryObj } from '@storybook/react';

import { OnboardingProvider } from './onboarding-provider';

const meta: Meta<typeof OnboardingProvider> = {
    title: 'Components/OnboardingProvider',
    component: OnboardingProvider,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof OnboardingProvider>;

export const Default: Story = {
    args: {},
};
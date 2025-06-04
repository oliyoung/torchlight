import type { Meta, StoryObj } from '@storybook/react';

import { CoachOnboardingModal } from './coach-onboarding-modal';

const meta: Meta<typeof CoachOnboardingModal> = {
    title: 'Components/CoachOnboardingModal',
    component: CoachOnboardingModal,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof CoachOnboardingModal>;

export const Default: Story = {
    args: {},
};
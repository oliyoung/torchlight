import type { Meta, StoryObj } from '@storybook/react';

import { TrainingPlanAssistantsList } from './training-plan-assistants-list';

const meta: Meta<typeof TrainingPlanAssistantsList> = {
    title: 'Components/TrainingPlanAssistantsList',
    component: TrainingPlanAssistantsList,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TrainingPlanAssistantsList>;

export const Default: Story = {
    args: {},
};
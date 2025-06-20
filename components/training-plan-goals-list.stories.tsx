import type { Meta, StoryObj } from '@storybook/react';

import { TrainingPlanGoalsList } from './training-plan-goals-list';

const meta: Meta<typeof TrainingPlanGoalsList> = {
    title: 'Components/TrainingPlanGoalsList',
    component: TrainingPlanGoalsList,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TrainingPlanGoalsList>;

export const Default: Story = {
    args: {},
};
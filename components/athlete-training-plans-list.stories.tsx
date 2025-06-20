import type { Meta, StoryObj } from '@storybook/react';

import { AthleteTrainingPlansList } from './athlete-training-plans-list';

const meta: Meta<typeof AthleteTrainingPlansList> = {
    title: 'Components/AthleteTrainingPlansList',
    component: AthleteTrainingPlansList,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AthleteTrainingPlansList>;

export const Default: Story = {
    args: {},
};
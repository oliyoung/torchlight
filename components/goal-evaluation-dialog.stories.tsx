import type { Meta, StoryObj } from '@storybook/react';

import { GoalEvaluationDialog } from './goal-evaluation-dialog';

const meta: Meta<typeof GoalEvaluationDialog> = {
    title: 'Components/GoalEvaluationDialog',
    component: GoalEvaluationDialog,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof GoalEvaluationDialog>;

export const Default: Story = {
    args: {},
};
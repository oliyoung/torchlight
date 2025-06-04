import type { Meta, StoryObj } from '@storybook/react';

import { GoalSelectDialog } from './goal-select-dialog';

const meta: Meta<typeof GoalSelectDialog> = {
    title: 'Components/UI/GoalSelectDialog',
    component: GoalSelectDialog,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof GoalSelectDialog>;

export const Default: Story = {
    args: {},
};
import type { Meta, StoryObj } from '@storybook/react';

import { GoalMultiSelect } from './goal-multi-select';

const meta: Meta<typeof GoalMultiSelect> = {
    title: 'Components/UI/GoalMultiSelect',
    component: GoalMultiSelect,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof GoalMultiSelect>;

export const Default: Story = {
    args: {},
};
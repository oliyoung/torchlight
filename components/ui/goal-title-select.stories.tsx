import type { Meta, StoryObj } from '@storybook/react';

import { GoalTitleSelect } from './goal-title-select';

const meta: Meta<typeof GoalTitleSelect> = {
    title: 'Components/UI/GoalTitleSelect',
    component: GoalTitleSelect,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof GoalTitleSelect>;

export const Default: Story = {
    args: {},
};
import type { Meta, StoryObj } from '@storybook/react';

import { SportSelect } from './sport-select';

const meta: Meta<typeof SportSelect> = {
    title: 'Components/UI/SportSelect',
    component: SportSelect,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SportSelect>;

export const Default: Story = {
    args: {},
};
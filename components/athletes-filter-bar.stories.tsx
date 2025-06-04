import type { Meta, StoryObj } from '@storybook/react';

import { AthletesFilterBar } from './athletes-filter-bar';

const meta: Meta<typeof AthletesFilterBar> = {
    title: 'Components/AthletesFilterBar',
    component: AthletesFilterBar,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AthletesFilterBar>;

export const Default: Story = {
    args: {},
};
import type { Meta, StoryObj } from '@storybook/react';

import { Command } from './command';

const meta: Meta<typeof Command> = {
    title: 'Components/UI/Command',
    component: Command,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Command>;

export const Default: Story = {
    args: {},
};
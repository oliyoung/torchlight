import type { Meta, StoryObj } from '@storybook/react';

import { Tooltip } from './tooltip';

const meta: Meta<typeof Tooltip> = {
    title: 'Components/UI/Tooltip',
    component: Tooltip,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
    args: {},
};
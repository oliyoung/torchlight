import type { Meta, StoryObj } from '@storybook/react';

import { Sheet } from './sheet';

const meta: Meta<typeof Sheet> = {
    title: 'Components/UI/Sheet',
    component: Sheet,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
    args: {},
};
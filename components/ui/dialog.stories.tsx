import type { Meta, StoryObj } from '@storybook/react';

import { Dialog } from './dialog';

const meta: Meta<typeof Dialog> = {
    title: 'Components/UI/Dialog',
    component: Dialog,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
    args: {},
};
import type { Meta, StoryObj } from '@storybook/react';

import { EmptyState } from './empty-state';

const meta: Meta<typeof EmptyState> = {
    title: 'Components/UI/EmptyState',
    component: EmptyState,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
    args: {},
};
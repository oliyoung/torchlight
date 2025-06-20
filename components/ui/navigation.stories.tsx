// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react';

import { Navigation } from './navigation';

const meta: Meta<typeof Navigation> = {
    title: 'Components/UI/Navigation',
    component: Navigation,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Navigation>;

export const Default: Story = {
    args: {},
};
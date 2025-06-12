// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react';

import { Footer } from './footer';

const meta: Meta<typeof Footer> = {
    title: 'Components/Footer',
    component: Footer,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Footer>;

export const Default: Story = {
    args: {},
};
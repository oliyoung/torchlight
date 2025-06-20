import type { Meta, StoryObj } from '@storybook/react';

import { Breadcrumb } from './breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
    title: 'Components/UI/Breadcrumb',
    component: Breadcrumb,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
    args: {},
};
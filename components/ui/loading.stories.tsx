import type { Meta, StoryObj } from '@storybook/react';

import { Loading } from './loading';

const meta: Meta<typeof Loading> = {
    title: 'Components/UI/Loading',
    component: Loading,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Loading>;

export const Default: Story = {
    args: {},
};
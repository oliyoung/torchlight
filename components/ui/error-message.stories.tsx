import type { Meta, StoryObj } from '@storybook/react';

import { ErrorMessage } from './error-message';

const meta: Meta<typeof ErrorMessage> = {
    title: 'Components/UI/ErrorMessage',
    component: ErrorMessage,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ErrorMessage>;

export const Default: Story = {
    args: {},
};
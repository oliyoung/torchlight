import type { Meta, StoryObj } from '@storybook/react';

import { DatePicker } from './date-picker';

const meta: Meta<typeof DatePicker> = {
    title: 'Components/UI/DatePicker',
    component: DatePicker,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
    args: {},
};
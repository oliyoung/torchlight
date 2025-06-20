import type { Meta, StoryObj } from '@storybook/react';

import { AthleteCombobox } from './athlete-combobox';

const meta: Meta<typeof AthleteCombobox> = {
    title: 'Components/UI/AthleteCombobox',
    component: AthleteCombobox,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AthleteCombobox>;

export const Default: Story = {
    args: {},
};
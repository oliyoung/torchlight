// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react';

import LastAthletes from './last-athletes';

const meta: Meta<typeof LastAthletes> = {
    title: 'Components/LastAthletes',
    component: LastAthletes,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof LastAthletes>;

export const Default: Story = {
    args: {},
};
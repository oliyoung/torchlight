// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react';

import { LastSessionLogs } from './last-session-logs';

const meta: Meta<typeof LastSessionLogs> = {
    title: 'Components/LastSessionLogs',
    component: LastSessionLogs,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof LastSessionLogs>;

export const Default: Story = {
    args: {},
};
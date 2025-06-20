import type { Meta, StoryObj } from '@storybook/react';

import { DropdownMenu } from './dropdown-menu';

const meta: Meta<typeof DropdownMenu> = {
    title: 'Components/UI/DropdownMenu',
    component: DropdownMenu,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
    args: {},
};
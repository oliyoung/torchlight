import type { Meta, StoryObj } from '@storybook/react';

import { SearchInput } from './search-input';

const meta: Meta<typeof SearchInput> = {
    title: 'Components/UI/SearchInput',
    component: SearchInput,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
    args: {},
};
import type { Meta, StoryObj } from '@storybook/react';

import { AssistantMultiSelect } from './assistant-multi-select';

const meta: Meta<typeof AssistantMultiSelect> = {
    title: 'Components/UI/AssistantMultiSelect',
    component: AssistantMultiSelect,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AssistantMultiSelect>;

export const Default: Story = {
    args: {},
};
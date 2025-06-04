import type { Meta, StoryObj } from '@storybook/react';

import { YouthSessionReview } from '@/components/youth-session-review';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
    title: 'Components/YouthSessionReview',
    component: YouthSessionReview,
    parameters: {
        // Optional parameter to center the component in the Canvas.
        // Learn more: https://storybook.js.org/docs/configure/story-layout
        layout: 'centered',
    },
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
    argTypes: {
        athleteAge: { control: 'number' },
        onReviewComplete: { action: 'reviewComplete' },
    },
} satisfies Meta<typeof YouthSessionReview>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories#play-function
export const Default: Story = {
    args: {
        athleteAge: 16,
        onReviewComplete: (transcript) => console.log('Review complete:', transcript),
    },
};

export const YoungerAthlete: Story = {
    args: {
        athleteAge: 10,
        onReviewComplete: (transcript) => console.log('Review complete:', transcript),
    },
};
import type { Meta, StoryObj } from "@storybook/react";
import { NewAthleteForm } from "./new-athlete-form";

const meta: Meta<typeof NewAthleteForm> = {
	title: "Forms/NewAthleteForm",
	component: NewAthleteForm,
	parameters: {
		layout: "padded",
	},
	decorators: [
		(Story) => (
			<div className="max-w-2xl mx-auto p-6">
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof NewAthleteForm>;

export const Default: Story = {};
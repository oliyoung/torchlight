import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { Plus, Download, Settings } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants and sizes for different use cases.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button variants for different contexts and emphasis levels.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon"><Settings className="h-4 w-4" /></Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different button sizes for various UI contexts.',
      },
    },
  },
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button><Plus className="mr-2 h-4 w-4" />Add Athlete</Button>
      <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
      <Button size="icon"><Settings /></Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with icons for enhanced visual communication.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button disabled>Disabled Default</Button>
      <Button variant="secondary" disabled>Disabled Secondary</Button>
      <Button variant="outline" disabled>Disabled Outline</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled button states for non-interactive contexts.',
      },
    },
  },
};
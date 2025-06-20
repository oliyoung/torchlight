import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Label } from './label';
import { Search, Mail, Lock } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible input component for forms and user interaction.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    disabled: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="coach@example.com" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input with a proper label for accessibility.',
      },
    },
  },
};

export const InputTypes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label>Text Input</Label>
        <Input type="text" placeholder="Enter your name" />
      </div>
      <div className="space-y-2">
        <Label>Email Input</Label>
        <Input type="email" placeholder="coach@example.com" />
      </div>
      <div className="space-y-2">
        <Label>Password Input</Label>
        <Input type="password" placeholder="••••••••" />
      </div>
      <div className="space-y-2">
        <Label>Number Input</Label>
        <Input type="number" placeholder="0" />
      </div>
      <div className="space-y-2">
        <Label>Search Input</Label>
        <Input type="search" placeholder="Search athletes..." />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different input types for various data formats.',
      },
    },
  },
};

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-8" />
      </div>
      <div className="relative">
        <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="email" placeholder="Email" className="pl-8" />
      </div>
      <div className="relative">
        <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="password" placeholder="Password" className="pl-8" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Inputs with icons for enhanced visual communication.',
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label>Default</Label>
        <Input placeholder="Normal input" />
      </div>
      <div className="space-y-2">
        <Label>Focused</Label>
        <Input placeholder="Focused input" autoFocus />
      </div>
      <div className="space-y-2">
        <Label>Disabled</Label>
        <Input placeholder="Disabled input" disabled />
      </div>
      <div className="space-y-2">
        <Label>With Value</Label>
        <Input value="Jordan Smith" readOnly />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different input states for various interactions.',
      },
    },
  },
};
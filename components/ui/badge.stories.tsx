import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';
import { CheckCircle, Clock, AlertTriangle, Star } from 'lucide-react';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A small label component for displaying statuses, categories, or counts.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available badge variants for different contexts.',
      },
    },
  },
};

export const SportsBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Basketball</Badge>
      <Badge variant="secondary">Soccer</Badge>
      <Badge variant="outline">Tennis</Badge>
      <Badge variant="secondary">Swimming</Badge>
      <Badge variant="outline">Track & Field</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sports category badges for athlete classification.',
      },
    },
  },
};

export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default" className="bg-green-600">
        <CheckCircle className="mr-1 h-3 w-3" />
        Active
      </Badge>
      <Badge variant="secondary">
        <Clock className="mr-1 h-3 w-3" />
        In Progress
      </Badge>
      <Badge variant="outline">
        Completed
      </Badge>
      <Badge variant="destructive">
        <AlertTriangle className="mr-1 h-3 w-3" />
        At Risk
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Status badges with icons for goal and athlete tracking.',
      },
    },
  },
};

export const SkillLevelBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline" className="border-yellow-500 text-yellow-700">
        Beginner
      </Badge>
      <Badge variant="secondary">
        Intermediate
      </Badge>
      <Badge variant="default" className="bg-blue-600">
        Advanced
      </Badge>
      <Badge variant="default" className="bg-purple-600">
        <Star className="mr-1 h-3 w-3" />
        Elite
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Skill level badges for athlete ability classification.',
      },
    },
  },
};

export const PositionBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary">Point Guard</Badge>
      <Badge variant="outline">Shooting Guard</Badge>
      <Badge variant="secondary">Small Forward</Badge>
      <Badge variant="outline">Power Forward</Badge>
      <Badge variant="secondary">Center</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Position badges for team sports athlete roles.',
      },
    },
  },
};

export const WithCounts: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Goals: 12</Badge>
      <Badge variant="secondary">Sessions: 8</Badge>
      <Badge variant="outline">Achievements: 5</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges displaying counts or metrics.',
      },
    },
  },
};
import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { MoreHorizontal, Calendar, Target } from 'lucide-react';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible card component for displaying content with header, body, and footer sections.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Default Card</CardTitle>
        <CardDescription>This is a simple card example.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. This is the main body of the card.</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card with Footer</CardTitle>
        <CardDescription>A card that includes footer actions.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card demonstrates how to use the footer section for actions or additional information.</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="mr-2">Cancel</Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Card with footer containing action buttons.',
      },
    },
  },
};

export const AthleteProfile: Story = {
  render: () => (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="https://placekitten.com/100/100" />
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Jordan Smith</CardTitle>
              <CardDescription>Basketball • Senior</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Point Guard</Badge>
          <Badge variant="outline">Varsity</Badge>
          <Badge variant="outline">Captain</Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          "Exceptional court vision and leadership skills. Needs work on defensive positioning."
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-1 h-3 w-3" />
          Last session: 2 days ago
        </div>
        <Button size="sm">View Profile</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example showing an athlete profile card with avatar, badges, and actions.',
      },
    },
  },
};

export const GoalCard: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Improve Free Throw Percentage</CardTitle>
            <CardDescription>Performance Goal • In Progress</CardDescription>
          </div>
          <Badge>Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          Target: Achieve 85% free throw accuracy by end of season
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>72%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '72%' }}></div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Last updated: 3 days ago
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="mr-2">
          <Target className="mr-1 h-3 w-3" />
          Update Progress
        </Button>
        <Button size="sm">View Details</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of a goal tracking card with progress indicators and actions.',
      },
    },
  },
};

export const SimpleContent: Story = {
  render: () => (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-2">
          <h3 className="font-semibold">Quick Stats</h3>
          <div className="text-2xl font-bold">24</div>
          <p className="text-sm text-muted-foreground">Active Athletes</p>
        </div>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Simple card with just content, useful for stats or metrics display.',
      },
    },
  },
};
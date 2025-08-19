import type { Meta, StoryObj } from '@storybook/react'

import * as BadgesAutomaticCarousel from '.'

const meta = {
  title: 'UI/BadgesAutomaticCarousel',
  component: BadgesAutomaticCarousel.Root,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    autoplayDelay: 2000,
  },
  argTypes: {
    autoplayDelay: {
      control: { type: 'range', min: 500, max: 5000, step: 100 },
      description: 'Delay between automatic transitions in milliseconds',
    },
  },
} satisfies Meta<typeof BadgesAutomaticCarousel.Root>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => (
    <div className="max-w-lg">
      <BadgesAutomaticCarousel.Root {...args}>
        <BadgesAutomaticCarousel.Content>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(item => (
            <BadgesAutomaticCarousel.Item key={item} variant="blue-subtle">
              Something happened {item}m ago
            </BadgesAutomaticCarousel.Item>
          ))}
        </BadgesAutomaticCarousel.Content>
        <BadgesAutomaticCarousel.Fade />
      </BadgesAutomaticCarousel.Root>
    </div>
  ),
}

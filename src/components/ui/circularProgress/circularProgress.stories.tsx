import type { Meta, StoryObj } from '@storybook/react'

import { CircularProgress } from '.'

const meta = {
  title: 'UI/CircularProgress',
  component: CircularProgress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    percentage: 50,
  },
  argTypes: {
    percentage: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    size: {
      control: { type: 'range', min: 50, max: 300, step: 10 },
    },
    gapDegrees: {
      control: { type: 'range', min: 0, max: 360, step: 1 },
    },
    strokeWidth: {
      control: { type: 'range', min: 5, max: 30, step: 1 },
    },
    color: {
      control: { type: 'select' },
      options: ['#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#F97316'],
    },
  },
} satisfies Meta<typeof CircularProgress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const Complete: Story = {
  args: {
    percentage: 100,
    color: '#10B981',
  },
}

export const Empty: Story = {
  args: {
    percentage: 0,
    color: '#EF4444',
  },
}

export const CustomValue: Story = {
  args: {
    percentage: 95,
    color: '#10B981',
  },
}

export const Small: Story = {
  args: {
    percentage: 85,
    size: 120,
    strokeWidth: 12,
  },
}

export const Large: Story = {
  args: {
    percentage: 65,
    size: 250,
    strokeWidth: 25,
  },
}

export const Overview: Story = {
  render: () => {
    const variants = [
      { value: '25%', percentage: 25, color: '#EF4444' },
      { value: '50%', percentage: 50, color: '#F97316' },
      { value: '75%', percentage: 75, color: '#3B82F6' },
      { value: '100%', percentage: 100, color: '#10B981' },
    ]

    return (
      <div className="flex gap-8">
        {variants.map((variant, index) => (
          <CircularProgress key={index} {...variant} />
        ))}
      </div>
    )
  },
}

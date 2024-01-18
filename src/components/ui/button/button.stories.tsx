import type { Meta, StoryObj } from '@storybook/react'

import { Button, buttonVariantsConfig } from '.'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    children: 'Sample Button',
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  args: {},
}

export const AllOptions: Story = {
  render: () => {
    const variants: any[] = Object.keys(buttonVariantsConfig.variant)
    return (
      <div className="space-y-4">
        {variants.map(variant => (
          <div key={variant}>
            <p className="text-xs">{variant}</p>
            <div>
              <Button variant={variant}>Sample Button</Button>
            </div>
          </div>
        ))}
      </div>
    )
  },
}

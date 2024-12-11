import type { Meta, StoryObj } from '@storybook/react'

import { PageTitle } from '@/components/ui/pageTitleText'

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
    const sizes: any[] = ['sm', 'default', 'lg']
    return (
      <div className="space-y-8">
        {variants.map(variant => (
          <div className="w-full max-w-xl" key={variant}>
            <PageTitle className="mb-4" size="md">
              {variant}
            </PageTitle>
            <div className="flex flex-col gap-4 md:flex-row">
              {sizes.map(size => (
                <div key={size}>
                  <p className="mb-1 text-xs">{size}</p>
                  <div>
                    <Button size={size} variant={variant}>
                      Sample Button
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  },
}

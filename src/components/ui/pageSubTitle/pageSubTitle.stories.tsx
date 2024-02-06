import type { Meta, StoryObj } from '@storybook/react'

import { PageSubTitle } from '.'

const meta = {
  title: 'UI/PageSubTitle',
  component: PageSubTitle,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Page Sub Title Size',
  },
} satisfies Meta<typeof PageSubTitle>

export default meta
type Story = StoryObj<typeof meta>

export const AllOptions: Story = {
  render: () => {
    const sizes: any[] = ['sm', 'md', 'lg']
    return (
      <div className="space-y-8">
        {sizes.map(size => (
          <PageSubTitle key={size} size={size}>
            Page Sub Title Size "{size}"
          </PageSubTitle>
        ))}
      </div>
    )
  },
}

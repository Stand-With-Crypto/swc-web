import type { Meta, StoryObj } from '@storybook/react'

import { PageTitle } from '@/components/ui/pageTitleText'

const meta = {
  title: 'UI/PageTitle',
  component: PageTitle,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Page Title Size',
  },
} satisfies Meta<typeof PageTitle>

export default meta
type Story = StoryObj<typeof meta>

export const AllOptions: Story = {
  render: () => {
    const sizes: any[] = ['sm', 'md', 'lg']
    return (
      <div className="space-y-8">
        {sizes.map(size => (
          <PageTitle key={size} size={size}>
            Page Title Size "{size}"
          </PageTitle>
        ))}
      </div>
    )
  },
}

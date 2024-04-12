import type { Meta, StoryObj } from '@storybook/react'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'

const meta = {
  title: 'App/CryptoSupportHighlight',
  component: CryptoSupportHighlight,
  parameters: {
    options: { showPanel: false },
  },
  render: (args, { loaded }) => (
    <div className="mx-auto max-w-2xl">
      <CryptoSupportHighlight {...args} {...loaded} />
    </div>
  ),
} satisfies Meta<typeof CryptoSupportHighlight>

export default meta
type Story = StoryObj<typeof meta>

export const VeryFor: Story = {
  args: {
    stanceScore: 100,
  },
}

export const SomewhatFor: Story = {
  args: {
    stanceScore: 60,
  },
}

export const Neutral: Story = {
  args: {
    stanceScore: 50,
  },
}

export const Pending: Story = {
  args: {
    stanceScore: null,
  },
}

export const SomewhatAgainst: Story = {
  args: {
    stanceScore: 40,
  },
}

export const SomewhatVeryAgainst: Story = {
  args: {
    stanceScore: 0,
  },
}

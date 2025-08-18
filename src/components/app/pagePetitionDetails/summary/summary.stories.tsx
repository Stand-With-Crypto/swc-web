import type { Meta, StoryObj } from '@storybook/react'

import { SupportedLocale } from '@/utils/shared/supportedLocales'

import { SignaturesSummary } from '.'

const meta = {
  title: 'App/PagePetitionDetails/SignaturesSummary',
  component: SignaturesSummary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    signatures: 58209,
    goal: 100000,
    locale: SupportedLocale.EN_US,
    label:
      'Congress must bring the petition to the floor for discussion if 100k signatures have been made.',
  },
  argTypes: {
    signatures: {
      control: { type: 'number', min: 0 },
    },
    goal: {
      control: { type: 'number', min: 1 },
    },
  },
} satisfies Meta<typeof SignaturesSummary>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onSign: () => alert('Signing petition...'),
  },
}

export const GoalReached: Story = {
  args: {
    signatures: 125430,
    goal: 100000,
    label: 'Amazing! We have exceeded our goal. Thank you to everyone who signed this petition.',
    onSign: () => alert('Sharing petition...'),
  },
}

export const LargeNumbers: Story = {
  args: {
    signatures: 2750000,
    goal: 5500000,
    label:
      'This petition has gained massive support! The goal will be displayed in compact format (5M).',
    onSign: () => alert('Large scale petition signing!'),
  },
}

export const Closed: Story = {
  args: {
    signatures: 67543,
    goal: 100000,
    isClosed: true,
    label: 'This petition has been closed. Thank you to everyone who participated.',
    onSign: undefined,
  },
}

export const Mobile: Story = {
  args: {
    signatures: 42000,
    goal: 100000,
    label: 'Help us reach our goal! Every signature counts.',
    onSign: () => alert('Mobile petition signing!'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs'

import { SignatureProvider } from '@/components/app/pagePetitionDetails/signatureContext'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLocale } from '@/utils/shared/supportedLocales'

import { SignaturesSummary } from '.'

const countryCode = SupportedCountryCodes.US

const meta = {
  title: 'App/PagePetitionDetails/SignaturesSummary',
  component: SignaturesSummary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    goal: 100000,
    locale: SupportedLocale.EN_US,
    label:
      'Congress must bring the petition to the floor for discussion if 100k signatures have been made.',
  },
  argTypes: {
    goal: {
      control: { type: 'number', min: 1 },
    },
  },
  decorators: [
    Story => (
      <SignatureProvider actualSignatureCount={58209} petitionSlug="test-petition">
        <Story />
      </SignatureProvider>
    ),
  ],
} satisfies Meta<typeof SignaturesSummary>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    countryCode,
  },
}

export const GoalReached: Story = {
  args: {
    countryCode,
    goal: 100000,
    label: 'Amazing! We have exceeded our goal. Thank you to everyone who signed this petition.',
  },
  decorators: [
    Story => (
      <SignatureProvider actualSignatureCount={125430} petitionSlug="test-petition">
        <Story />
      </SignatureProvider>
    ),
  ],
}

export const LargeNumbers: Story = {
  args: {
    countryCode,
    goal: 5500000,
    label:
      'This petition has gained massive support! The goal will be displayed in compact format (5M).',
  },
  decorators: [
    Story => (
      <SignatureProvider actualSignatureCount={2750000} petitionSlug="test-petition">
        <Story />
      </SignatureProvider>
    ),
  ],
}

export const Closed: Story = {
  args: {
    countryCode,
    goal: 100000,
    isClosed: true,
    label: 'This petition has been closed. Thank you to everyone who participated.',
  },
  decorators: [
    Story => (
      <SignatureProvider actualSignatureCount={67543} petitionSlug="test-petition">
        <Story />
      </SignatureProvider>
    ),
  ],
}

export const Mobile: Story = {
  args: {
    countryCode,
    goal: 100000,
    label: 'Help us reach our goal! Every signature counts.',
  },
  decorators: [
    Story => (
      <SignatureProvider actualSignatureCount={42000} petitionSlug="test-petition">
        <Story />
      </SignatureProvider>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

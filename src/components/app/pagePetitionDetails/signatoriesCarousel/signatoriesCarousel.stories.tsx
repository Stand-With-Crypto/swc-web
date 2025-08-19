import type { Meta, StoryObj } from '@storybook/react'

import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { SignatoriesCarousel } from '.'

const meta = {
  title: 'App/PagePetitionDetails/SignatoriesCarousel',
  component: SignatoriesCarousel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    autoplayDelay: 3000,
  },
  argTypes: {
    autoplayDelay: {
      control: { type: 'range', min: 1000, max: 8000, step: 500 },
      description: 'Delay between automatic transitions in milliseconds',
    },
  },
} satisfies Meta<typeof SignatoriesCarousel>

export default meta
type Story = StoryObj<typeof meta>

const sampleSignatures = [
  {
    locale: 'CA',
    datetimeSigned: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 minute ago
  },
  {
    locale: 'NY',
    datetimeSigned: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 minutes ago
  },
  {
    locale: 'TX',
    datetimeSigned: new Date(Date.now() - 7 * 60 * 1000).toISOString(), // 7 minutes ago
  },
  {
    locale: 'FL',
    datetimeSigned: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
  },
  {
    locale: 'IL',
    datetimeSigned: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
  },
]

export const Default: Story = {
  args: {
    countryCode: SupportedCountryCodes.US,
    lastSignatures: sampleSignatures,
  },
}

export const RecentSigners: Story = {
  render: args => (
    <div className="w-96">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Recent signers</h3>
      </div>
      <SignatoriesCarousel {...args} />
    </div>
  ),
  args: {
    countryCode: SupportedCountryCodes.US,
    lastSignatures: sampleSignatures,
    autoplayDelay: 2500,
  },
}

export const FewSignatures: Story = {
  args: {
    countryCode: SupportedCountryCodes.US,
    lastSignatures: [
      {
        locale: 'CA',
        datetimeSigned: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        locale: 'NY',
        datetimeSigned: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      },
    ],
  },
}

export const EmptyState: Story = {
  args: {
    lastSignatures: [],
    countryCode: SupportedCountryCodes.US,
  },
}

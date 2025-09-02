import type { Meta, StoryObj } from '@storybook/react'

import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLocale } from '@/utils/shared/supportedLocales'

import { PetitionCard } from '.'

const meta = {
  title: 'App/Petitions/PetitionCard',
  component: PetitionCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    countryCode: {
      control: 'text',
      description: 'Country code',
      options: [
        SupportedCountryCodes.US,
        SupportedCountryCodes.GB,
        SupportedCountryCodes.CA,
        SupportedCountryCodes.AU,
      ],
    },
    slug: {
      control: 'text',
      description: 'Slug of the petition',
    },
    imgSrc: {
      control: 'text',
      description: 'Optional image URL for the petition',
    },
    title: {
      control: 'text',
      description: 'The title of the petition',
    },
    signaturesCount: {
      control: 'number',
      description: 'Number of signatures for the petition',
    },
    locale: {
      control: 'select',
      options: [SupportedLocale.EN_US],
      description: 'Locale for formatting numbers',
    },
  },
} satisfies Meta<typeof PetitionCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    slug: 'any-slug',
    title: 'Save Crypto Innovation',
    signaturesCount: 23053,
    imgSrc: '/nfts/Genius_NFT_2.png',
    countryCode: SupportedCountryCodes.US,
  },
}

export const WithoutImage: Story = {
  args: {
    slug: 'any-slug',
    title: 'Support FIT21 Act',
    signaturesCount: 156789,
    countryCode: SupportedCountryCodes.US,
  },
}

export const MobileView: Story = {
  args: {
    slug: 'any-slug',
    title: 'Oppose Harmful Regulations',
    signaturesCount: 89432,
    countryCode: SupportedCountryCodes.US,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

export const ThreeActionsGrid: Story = {
  args: {
    title: 'Three Actions Example',
    signaturesCount: 0,
    slug: 'any-slug',
    countryCode: SupportedCountryCodes.US,
  },
  render: () => (
    <div className="grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
      <PetitionCard
        countryCode={SupportedCountryCodes.US}
        imgSrc="/nfts/Genius_NFT_2.png"
        signaturesCount={1245678}
        slug="any-slug"
        title="Save Crypto Innovation"
      />
      <PetitionCard
        countryCode={SupportedCountryCodes.US}
        signaturesCount={867432}
        slug="any-slug"
        title="Support FIT21 Act"
      />
      <PetitionCard
        countryCode={SupportedCountryCodes.US}
        imgSrc="/nfts/Genius_NFT_2.png"
        signaturesCount={543219}
        slug="any-slug"
        title="Oppose Harmful Regulations"
      />
    </div>
  ),
}

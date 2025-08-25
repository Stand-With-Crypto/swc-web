import type { Meta, StoryObj } from '@storybook/react'

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
    href: {
      control: 'text',
      description: 'URL that the petition card links to',
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
    title: 'Save Crypto Innovation',
    signaturesCount: 23053,
    imgSrc: '/nfts/Genius_NFT_2.png',
    href: 'https://coinbase.com',
  },
}

export const WithoutImage: Story = {
  args: {
    title: 'Support FIT21 Act',
    signaturesCount: 156789,
    href: 'https://coinbase.com',
  },
}

export const MobileView: Story = {
  args: {
    title: 'Oppose Harmful Regulations',
    signaturesCount: 89432,
    href: 'https://coinbase.com',
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

    href: 'https://coinbase.com',
  },
  render: () => (
    <div className="grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
      <PetitionCard
        href="https://coinbase.com"
        imgSrc="/nfts/Genius_NFT_2.png"
        signaturesCount={1245678}
        title="Save Crypto Innovation"
      />
      <PetitionCard
        href="https://coinbase.com"
        signaturesCount={867432}
        title="Support FIT21 Act"
      />
      <PetitionCard
        href="https://coinbase.com"
        imgSrc="/nfts/Genius_NFT_2.png"
        signaturesCount={543219}
        title="Oppose Harmful Regulations"
      />
    </div>
  ),
}

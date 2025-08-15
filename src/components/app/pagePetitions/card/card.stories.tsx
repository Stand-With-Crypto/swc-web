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
    description: {
      control: 'text',
      description: 'The description of the petition',
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
    description: 'Join over 1,000,000 advocates fighting to keep crypto in America.',
    signaturesCount: 23053,
    imgSrc: '/nfts/Genius_NFT_2.png',
    href: 'https://coinbase.com',
  },
}

export const WithoutImage: Story = {
  args: {
    title: 'Support FIT21 Act',
    description: 'Support legislation that provides regulatory clarity for digital assets.',
    signaturesCount: 156789,
    href: 'https://coinbase.com',
  },
}

export const MobileView: Story = {
  args: {
    title: 'Oppose Harmful Regulations',
    description: 'Oppose regulations that would stifle blockchain innovation and development.',
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
    description: 'This story shows 3 petition cards representing different crypto advocacy actions',
    signaturesCount: 0,
    href: 'https://coinbase.com',
  },
  render: () => (
    <div className="grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
      <PetitionCard
        description="Join over 1,000,000 advocates fighting to keep crypto innovation in America."
        href="https://coinbase.com"
        imgSrc="/nfts/Genius_NFT_2.png"
        signaturesCount={1245678}
        title="Save Crypto Innovation"
      />
      <PetitionCard
        description="Support the FIT21 Act to provide regulatory clarity for digital assets and blockchain technology."
        href="https://coinbase.com"
        signaturesCount={867432}
        title="Support FIT21 Act"
      />
      <PetitionCard
        description="Oppose harmful regulations that would stifle blockchain innovation and crypto development."
        href="https://coinbase.com"
        imgSrc="/nfts/Genius_NFT_2.png"
        signaturesCount={543219}
        title="Oppose Harmful Regulations"
      />
    </div>
  ),
}

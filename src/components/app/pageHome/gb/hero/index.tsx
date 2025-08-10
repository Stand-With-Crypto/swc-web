import { Hero, HeroAnnouncementCard } from '@/components/app/pageHome/common/hero'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { GBHeroVideoDialog } from './videoDialog'

const countryCode = SupportedCountryCodes.GB

export function GbHero() {
  const videoDialogRender = (
    <GBHeroVideoDialog>
      <HeroAnnouncementCard.Image
        media={{
          src: 'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/gb/hero_image.gif',
          alt: 'Help UK lead stablecoin innovation',
        }}
      >
        <HeroAnnouncementCard.CTA buttonText="Watch video">
          Help UK lead stablecoin innovation.
        </HeroAnnouncementCard.CTA>
      </HeroAnnouncementCard.Image>
    </GBHeroVideoDialog>
  )

  return (
    <Hero>
      <Hero.Heading>
        <Hero.Title>
          It’s time to support crypto in the <span className="text-primary-cta">UK</span>
        </Hero.Title>
        <Hero.Subtitle>
          Crypto’s future in the UK remains uncertain. If you believe in the power of the blockchain
          and want the Government to foster a positive business and policy environment for crypto
          assets and blockchain technology in the UK, make your voice heard.
        </Hero.Subtitle>
        <Hero.HeadingCTA countryCode={countryCode} />
      </Hero.Heading>
      <HeroAnnouncementCard
        authenticatedContent={videoDialogRender}
        unauthenticatedContent={videoDialogRender}
      />
    </Hero>
  )
}

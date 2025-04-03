import Link from 'next/link'

import { Hero, HeroAnnouncementCard } from '@/components/app/pageHome/common/hero'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const urls = getIntlUrls(SupportedCountryCodes.GB)

export function GbHero() {
  return (
    <Hero>
      <Hero.Heading>
        <Hero.Title>
          It’s time to fight for crypto in <span className="text-primary-cta">Britain</span>
        </Hero.Title>
        <Hero.Subtitle>
          Britons own crypto. And yet, crypto’s future in Britain remains uncertain. Congress is
          writing the rules as we speak – but they won’t vote YES until they’ve heard from you.
        </Hero.Subtitle>
        <Hero.HeadingCTA />
      </Hero.Heading>
      <HeroAnnouncementCard
        authenticatedContent={
          <Link href={urls.profile()}>
            <HeroAnnouncementCard.Image
              media={{
                src: '/gb/home/hero.svg',
                alt: 'Stay up to date on crypto policy by following @StandWCrypto_UK on X.',
              }}
            >
              <HeroAnnouncementCard.CTA buttonText="Get started">
                Fight for crypto in Britain.
              </HeroAnnouncementCard.CTA>
            </HeroAnnouncementCard.Image>
          </Link>
        }
        unauthenticatedContent={
          <HeroAnnouncementCard.Image
            media={{
              src: '/gb/home/hero.svg',
              alt: 'Stay up to date on crypto policy by following @StandWCrypto_UK on X.',
            }}
          >
            <HeroAnnouncementCard.CTA buttonText="Join">
              Fight for crypto in Britain.
            </HeroAnnouncementCard.CTA>
          </HeroAnnouncementCard.Image>
        }
      />
    </Hero>
  )
}

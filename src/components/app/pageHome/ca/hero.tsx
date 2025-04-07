import Link from 'next/link'

import { Hero, HeroAnnouncementCard } from '@/components/app/pageHome/common/hero'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.CA

const urls = getIntlUrls(countryCode)

export function CaHero() {
  return (
    <Hero>
      <Hero.Heading>
        <Hero.Title>
          It’s time to fight for crypto in <span className="text-primary-cta">Canada</span>
        </Hero.Title>
        <Hero.Subtitle>
          Canadians own crypto. And yet, crypto’s future in Canada remains uncertain. Congress is
          writing the rules as we speak – but they won’t vote YES until they’ve heard from you.
        </Hero.Subtitle>
        <Hero.HeadingCTA countryCode={countryCode} ctaText="Join the Movement" />
      </Hero.Heading>
      <HeroAnnouncementCard
        authenticatedContent={
          <Link href={urls.profile()}>
            <HeroAnnouncementCard.Image
              media={{
                src: '/ca/home/hero.svg',
                alt: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
              }}
            >
              <HeroAnnouncementCard.CTA buttonText="Get started">
                Advocate for crypto in Canada.
              </HeroAnnouncementCard.CTA>
            </HeroAnnouncementCard.Image>
          </Link>
        }
        unauthenticatedContent={
          <HeroAnnouncementCard.Image
            media={{
              src: '/ca/home/hero.svg',
              alt: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
            }}
          >
            <HeroAnnouncementCard.CTA buttonText="Join">
              Advocate for crypto in Canada.
            </HeroAnnouncementCard.CTA>
          </HeroAnnouncementCard.Image>
        }
      />
    </Hero>
  )
}

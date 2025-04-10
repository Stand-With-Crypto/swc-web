import Link from 'next/link'

import { Hero, HeroAnnouncementCard } from '@/components/app/pageHome/common/hero'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.AU

const urls = getIntlUrls(countryCode)

export function AuHero() {
  return (
    <Hero>
      <Hero.Heading>
        <Hero.Title>
          It’s time to support crypto in <span className="text-primary-cta">Australia</span>
        </Hero.Title>
        <Hero.Subtitle>
          1 in 5 Australians own crypto. And yet, crypto’s future in Australia remains uncertain.
          The Government is writing the rules as we speak – but they won’t vote YES until they’ve
          heard from you.
        </Hero.Subtitle>
        <Hero.HeadingCTA countryCode={countryCode} />
      </Hero.Heading>
      <HeroAnnouncementCard
        authenticatedContent={
          <Link href={urls.profile()}>
            <HeroAnnouncementCard.Image
              media={{
                src: '/au/home/hero.svg',
                alt: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
              }}
            >
              <HeroAnnouncementCard.CTA buttonText="Get started">
                Advocate for crypto in Australia.
              </HeroAnnouncementCard.CTA>
            </HeroAnnouncementCard.Image>
          </Link>
        }
        unauthenticatedContent={
          <HeroAnnouncementCard.Image
            media={{
              src: '/au/home/hero.svg',
              alt: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
            }}
          >
            <HeroAnnouncementCard.CTA buttonText="Join">
              Advocate for crypto in Australia.
            </HeroAnnouncementCard.CTA>
          </HeroAnnouncementCard.Image>
        }
      />
    </Hero>
  )
}

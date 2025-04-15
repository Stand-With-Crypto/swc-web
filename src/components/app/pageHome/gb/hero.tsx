import Link from 'next/link'

import { Hero, HeroAnnouncementCard } from '@/components/app/pageHome/common/hero'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.GB

const urls = getIntlUrls(countryCode)

export function GbHero() {
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
      <div className="order-0 self-start md:container lg:order-1 lg:col-span-2 lg:px-0">
        <Link href={urls.newmodeDebankingAction()}>
          <HeroAnnouncementCard.Image
            media={{
              src: '/gb/home/hero.svg',
              alt: 'Stay up to date on crypto policy by following @StandWCrypto_UK on X.',
            }}
          >
            <HeroAnnouncementCard.CTA buttonText="Take action">
              Email your MP to stop unfair banking
            </HeroAnnouncementCard.CTA>
          </HeroAnnouncementCard.Image>
        </Link>
      </div>
    </Hero>
  )
}

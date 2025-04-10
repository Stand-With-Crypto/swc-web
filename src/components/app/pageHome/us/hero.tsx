import { Hero, HeroAnnouncementCard } from '@/components/app/pageHome/common/hero'
import { UserActionFormShareOnTwitterDialog } from '@/components/app/userActionFormShareOnTwitter/common/dialog'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.US

export function UsHero() {
  return (
    <Hero>
      <Hero.Heading>
        <Hero.Title>If you care about crypto, it's time to prove it</Hero.Title>
        <Hero.Subtitle>
          52 million Americans own crypto. And yet, crypto's future in America remains uncertain.
          Congress is writing the rules as we speak - but they won't vote YES until they've heard
          from you.
        </Hero.Subtitle>
        <Hero.HeadingCTA countryCode={countryCode} />
      </Hero.Heading>
      <HeroAnnouncementCard
        authenticatedContent={
          <UserActionFormShareOnTwitterDialog countryCode={SupportedCountryCodes.US}>
            <HeroAnnouncementCard.Image
              media={{
                videoSrc: 'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/heroImage.mp4',
                fallback: {
                  src: '/homepageHero.webp',
                  alt: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
                },
              }}
            >
              <HeroAnnouncementCard.CTA buttonText="Follow">
                Stay up to date on crypto policy by following @StandWithCrypto on X.
              </HeroAnnouncementCard.CTA>
            </HeroAnnouncementCard.Image>
          </UserActionFormShareOnTwitterDialog>
        }
        unauthenticatedContent={
          <HeroAnnouncementCard.Image
            media={{
              videoSrc: 'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/heroImage.mp4',
              fallback: {
                src: '/homepageHero.webp',
                alt: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
              },
            }}
          >
            <HeroAnnouncementCard.CTA buttonText="Join">
              Join Stand With Crypto and help us defend your right to own crypto in America.
            </HeroAnnouncementCard.CTA>
          </HeroAnnouncementCard.Image>
        }
      />
    </Hero>
  )
}

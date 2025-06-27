import { CaHeroVideoDialog } from '@/components/app/pageHome/ca/hero/videoDialog'
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
          It’s time to support crypto in <span className="text-primary-cta">Canada</span>
        </Hero.Title>
        <Hero.Subtitle>
          4 million Canadians own crypto. And yet, crypto’s future in Canada remains uncertain. This
          is our chance to shape the future of crypto policy and ensure Canada remains a global
          leader.
        </Hero.Subtitle>
        <Hero.HeadingCTA countryCode={countryCode} />
      </Hero.Heading>
      <HeroAnnouncementCard
        authenticatedContent={
          <CaHeroVideoDialog>
            <HeroAnnouncementCard.Image
              media={{
                src: 'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/ca/hero_image-nL27jTXESAmKGh7PDNHk959O2QVtMf.gif',
                alt: 'Help UK lead stablecoin innovation',
              }}
            >
              <HeroAnnouncementCard.CTA buttonText="Watch video">
                Help UK lead stablecoin innovation.
              </HeroAnnouncementCard.CTA>
            </HeroAnnouncementCard.Image>
          </CaHeroVideoDialog>
        }
        unauthenticatedContent={
          <HeroAnnouncementCard.Image
            media={{
              src: 'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/ca/hero_image-nL27jTXESAmKGh7PDNHk959O2QVtMf.gif',
              alt: 'Help UK lead stablecoin innovation',
            }}
          >
            <HeroAnnouncementCard.CTA buttonText="Join">
              Join the movement for crypto in Canada
            </HeroAnnouncementCard.CTA>
          </HeroAnnouncementCard.Image>
        }
      />
    </Hero>
  )
}

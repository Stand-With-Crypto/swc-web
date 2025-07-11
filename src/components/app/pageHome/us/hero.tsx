import { Hero, HeroAnnouncementCard } from '@/components/app/pageHome/common/hero'
import { getEmailActionWrapperComponentByCampaignName } from '@/components/app/userActionFormEmailCongressperson/getWrapperComponentByCampaignName'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

const countryCode = SupportedCountryCodes.US

const ClarityActWrapper = getEmailActionWrapperComponentByCampaignName({
  countryCode,
  campaignName: USUserActionEmailCampaignName.CLARITY_ACT_HOUSE_JUN_13_2025,
})

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
          <ClarityActWrapper>
            <HeroAnnouncementCard.Image
              media={{
                videoSrc: 'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/heroImage.mp4',
                fallback: {
                  src: '/homepageHero.webp',
                  alt: 'Email your House Member to pass the CLARITY Act',
                },
              }}
            >
              <HeroAnnouncementCard.CTA buttonText="Take action">
                Email your House Member to pass the CLARITY Act
              </HeroAnnouncementCard.CTA>
            </HeroAnnouncementCard.Image>
          </ClarityActWrapper>
        }
        unauthenticatedContent={
          <ClarityActWrapper>
            <HeroAnnouncementCard.Image
              media={{
                videoSrc: 'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/heroImage.mp4',
                fallback: {
                  src: '/homepageHero.webp',
                  alt: 'Email your House Member to pass the CLARITY Act',
                },
              }}
            >
              <HeroAnnouncementCard.CTA buttonText="Take action">
                Email your House Member to pass the CLARITY Act
              </HeroAnnouncementCard.CTA>
            </HeroAnnouncementCard.Image>
          </ClarityActWrapper>
        }
      />
    </Hero>
  )
}

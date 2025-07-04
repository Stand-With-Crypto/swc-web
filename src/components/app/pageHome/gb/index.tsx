import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { FoundersCarousel } from '@/components/app/pageHome/common/foundersCarousel'
import { HomePageSection } from '@/components/app/pageHome/common/homePageSectionLayout'
import { PartnerGrid } from '@/components/app/pageHome/common/partnerGrid'
import { TopLevelMetrics } from '@/components/app/pageHome/common/topLevelMetrics'
import { HomePageProps } from '@/components/app/pageHome/common/types'
import { DelayedRecentActivityWithMap } from '@/components/app/pageHome/us/delayedRecentActivity'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { DistrictsLeaderboard } from '@/components/app/pageReferrals/districtsLeaderboard'
import { YourDistrictRank } from '@/components/app/pageReferrals/yourDistrictRank'
import { RecentActivity } from '@/components/app/recentActivity'
import { UserActionFormReferDialog } from '@/components/app/userActionFormRefer/dialog'
import { UserActionGridCTAs } from '@/components/app/userActionGridCTAs'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { ResponsiveTabsOrSelect } from '@/components/ui/responsiveTabsOrSelect'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

import { GbHero } from './hero'

const countryCode = SupportedCountryCodes.GB
const urls = getIntlUrls(countryCode)

export function GbPageHome({
  topLevelMetrics,
  partners,
  founders,
  actions,
  countUsers,
  advocatePerStateDataProps,
}: HomePageProps &
  Awaited<ReturnType<typeof getHomepageData>> & {
    advocatePerStateDataProps: Awaited<ReturnType<typeof getAdvocatesMapData>>
  }) {
  return (
    <>
      <GbHero />

      <section className="container">
        <TopLevelMetrics
          countryCode={countryCode}
          {...topLevelMetrics}
          disableTooltips
          useGlobalLabels
        />
      </section>

      <HomePageSection>
        <HomePageSection.Title>
          <span className="text-primary-cta">Brits</span> believe in crypto
        </HomePageSection.Title>

        <RecentActivity>
          <ResponsiveTabsOrSelect
            analytics={'Homepage Our Community Tabs'}
            data-testid="community-leaderboard-tabs"
            defaultValue={RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY}
            options={[
              {
                value: RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
                label: 'Recent activity',
                content: (
                  <>
                    <HomePageSection.Subtitle className="hidden md:block">
                      See how the community is taking a stand to safeguard the future of crypto in
                      the UK.
                    </HomePageSection.Subtitle>
                    <DelayedRecentActivityWithMap
                      actions={actions}
                      advocatesMapPageData={advocatePerStateDataProps}
                      countUsers={countUsers.count}
                      countryCode={countryCode}
                    />
                  </>
                ),
              },
              {
                value: RecentActivityAndLeaderboardTabs.TOP_DISTRICTS,
                label: 'Top Districts',
                content: (
                  <div className="space-y-4">
                    <HomePageSection.Subtitle className="hidden md:block">
                      See which district has the most number of advocates.
                    </HomePageSection.Subtitle>
                    <YourDistrictRank />
                    {/* TODO: add leaderboard data */}
                    <DistrictsLeaderboard countryCode={countryCode} data={[]} />
                    <div className="mx-auto flex w-fit justify-center gap-2">
                      <LoginDialogWrapper
                        authenticatedContent={
                          <UserActionFormReferDialog countryCode={countryCode}>
                            <Button className="w-full">Refer</Button>
                          </UserActionFormReferDialog>
                        }
                      >
                        <Button className="w-full">Join</Button>
                      </LoginDialogWrapper>
                      <Button asChild variant="secondary">
                        <InternalLink href={urls.referrals()}>View all</InternalLink>
                      </Button>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </RecentActivity>
      </HomePageSection>

      {partners && (
        <HomePageSection>
          <HomePageSection.Title>Our partners</HomePageSection.Title>
          <HomePageSection.Subtitle>
            Leading crypto asset and blockchain firms are supporting Stand with Crypto in the UK. If
            you also want to become an official partner, fill out the form via the button below.
          </HomePageSection.Subtitle>
          <div className="flex flex-col items-center gap-6">
            <PartnerGrid partners={partners} />
            <Button asChild variant="secondary">
              <InternalLink href={urls.partners()}>View all</InternalLink>
            </Button>
          </div>
        </HomePageSection>
      )}

      <HomePageSection>
        <HomePageSection.Title>Get involved</HomePageSection.Title>
        <HomePageSection.Subtitle>
          The future of crypto is in your hands. Here’s how you can help.
        </HomePageSection.Subtitle>

        <UserActionGridCTAs />
      </HomePageSection>

      {founders && (
        <HomePageSection container={false}>
          <HomePageSection.Title>Featured founders</HomePageSection.Title>
          <HomePageSection.Subtitle>
            Members from our community that have founded crypto-related businesses in the UK.
          </HomePageSection.Subtitle>

          <FoundersCarousel founders={founders} />
        </HomePageSection>
      )}
    </>
  )
}

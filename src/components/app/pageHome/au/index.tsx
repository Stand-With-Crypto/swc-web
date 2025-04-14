import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { AdvocatesHeatmap } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmap'
import { AURecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/au/recentActivityAndLeaderboardTabs'
import { FoundersCarousel } from '@/components/app/pageHome/common/foundersCarousel'
import { HomePageSection } from '@/components/app/pageHome/common/homePageSectionLayout'
import { PartnerGrid } from '@/components/app/pageHome/common/partnerGrid'
import { HomepagePoliticiansSection } from '@/components/app/pageHome/common/politiciansSection'
import { TopLevelMetrics } from '@/components/app/pageHome/common/topLevelMetrics'
import { HomePageProps } from '@/components/app/pageHome/common/types'
import { RecentActivity } from '@/components/app/recentActivity'
import { UserActionGridCTAs } from '@/components/app/userActionGridCTAs'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { ResponsiveTabsOrSelect } from '@/components/ui/responsiveTabsOrSelect'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

import { AuHero } from './hero'

const countryCode = SupportedCountryCodes.AU

const urls = getIntlUrls(countryCode)

export function AuPageHome({
  topLevelMetrics,
  recentActivity,
  partners,
  founders,
  dtsiHomepagePoliticians,
  countUsers,
  advocatePerStateDataProps,
  actions,
}: HomePageProps & {
  advocatePerStateDataProps: Awaited<ReturnType<typeof getAdvocatesMapData>>
} & Awaited<ReturnType<typeof getHomepageData>>) {
  return (
    <>
      <AuHero />

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
          People in <span className="text-primary-cta">Australia</span> believe in crypto
        </HomePageSection.Title>
        <HomePageSection.Subtitle>
          See how the community is taking a stand to safeguard the future of crypto in Australia.
        </HomePageSection.Subtitle>

        <RecentActivity>
          <ResponsiveTabsOrSelect
            analytics={'Homepage Our Community Tabs'}
            data-testid="community-leaderboard-tabs"
            defaultValue={AURecentActivityAndLeaderboardTabs.RECENT_ACTIVITY_MAP}
            options={[
              {
                value: AURecentActivityAndLeaderboardTabs.RECENT_ACTIVITY_MAP,
                label: 'Recent activity map',
                content: (
                  <AdvocatesHeatmap
                    actions={actions}
                    advocatesMapPageData={advocatePerStateDataProps}
                    countUsers={countUsers.count}
                    countryCode={countryCode}
                    isEmbedded={false}
                  />
                ),
              },
              {
                value: AURecentActivityAndLeaderboardTabs.RECENT_ACTIVITY_LIST,
                label: 'Recent activity list',
                content: (
                  <div className="py-6">
                    <RecentActivity.List actions={recentActivity} />
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
            We’re proud to partner with some of the most influential and forward-thinking companies
            driving innovation through blockchain and crypto.
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
            Members from our community that have founded crypto-related businesses in Australia.
          </HomePageSection.Subtitle>

          <FoundersCarousel founders={founders} />
        </HomePageSection>
      )}

      <HomepagePoliticiansSection
        countryCode={countryCode}
        cryptoStanceGrade={DTSIFormattedLetterGrade}
        dtsiHomepagePoliticians={dtsiHomepagePoliticians}
      />
    </>
  )
}

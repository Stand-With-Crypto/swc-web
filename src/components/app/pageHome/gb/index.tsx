import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { AdvocatesHeatmap } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmap'
import { FoundersCarousel } from '@/components/app/pageHome/common/foundersCarousel'
import { HomePageSection } from '@/components/app/pageHome/common/homePageSectionLayout'
import { PartnerGrid } from '@/components/app/pageHome/common/partnerGrid'
import { HomepagePoliticiansSection } from '@/components/app/pageHome/common/politiciansSection'
import { TopLevelMetrics } from '@/components/app/pageHome/common/topLevelMetrics'
import { HomePageProps } from '@/components/app/pageHome/common/types'
import { GBRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/gb/recentActivityAndLeaderboardTabs'
import { RecentActivity } from '@/components/app/recentActivity'
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
  recentActivity,
  partners,
  founders,
  dtsiHomepagePoliticians,
  advocatePerStateDataProps,
  countUsers,
  actions,
}: HomePageProps & {
  advocatePerStateDataProps: Awaited<ReturnType<typeof getAdvocatesMapData>>
} & Awaited<ReturnType<typeof getHomepageData>>) {
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
        <HomePageSection.Subtitle>
          See how the community is taking a stand to safeguard the future of crypto in the UK.
        </HomePageSection.Subtitle>

        <RecentActivity>
          <ResponsiveTabsOrSelect
            analytics={'Homepage Our Community Tabs'}
            data-testid="community-leaderboard-tabs"
            defaultValue={GBRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY_MAP}
            options={[
              {
                value: GBRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY_MAP,
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
                value: GBRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY_LIST,
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

      <HomepagePoliticiansSection
        countryCode={countryCode}
        cryptoStanceGrade={DTSIFormattedLetterGrade}
        dtsiHomepagePoliticians={dtsiHomepagePoliticians}
      />
    </>
  )
}

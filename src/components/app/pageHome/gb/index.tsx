import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DelayedRecentActivityWithMap } from '@/components/app/pageHome/common/delayedRecentActivity'
import { FoundersCarousel } from '@/components/app/pageHome/common/foundersCarousel'
import { HomePageSection } from '@/components/app/pageHome/common/homePageSectionLayout'
import { PartnerGrid } from '@/components/app/pageHome/common/partnerGrid'
import { HomepagePoliticiansSection } from '@/components/app/pageHome/common/politiciansSection'
import { TopLevelMetrics } from '@/components/app/pageHome/common/topLevelMetrics'
import { HomePageProps } from '@/components/app/pageHome/common/types'
import { GbRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/gb/recentActivityAndLeaderboardTabs'
import { UserAddressProvider } from '@/components/app/pageReferrals/common/userAddress.context'
import { GbAdvocatesLeaderboard } from '@/components/app/pageReferrals/gb/leaderboard'
import {
  GbYourConstituencyRank,
  GbYourConstituencyRankingWrapper,
  GbYourConstituencyRankSuspense,
} from '@/components/app/pageReferrals/gb/yourConstituencyRanking'
import { RecentActivity } from '@/components/app/recentActivity'
import { UserActionFormReferDialog } from '@/components/app/userActionFormRefer/dialog'
import { UserActionGridCTAs } from '@/components/app/userActionGridCTAs'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { ResponsiveTabsOrSelect } from '@/components/ui/responsiveTabsOrSelect'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
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
  dtsiHomepagePoliticians,
  leaderboardData,
}: HomePageProps & {
  leaderboardData: DistrictRankingEntryWithRank[]
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
        <HomePageSection.Title>Our community</HomePageSection.Title>
        <HomePageSection.Subtitle className="md:hidden">
          See how our community is taking a stand to safeguard the future of crypto in the UK.
        </HomePageSection.Subtitle>

        <RecentActivity>
          <ResponsiveTabsOrSelect
            analytics={'Homepage Our Community Tabs'}
            data-testid="community-leaderboard-tabs"
            defaultValue={GbRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY}
            options={[
              {
                value: GbRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
                label: 'Recent activity',
                content: (
                  <>
                    <HomePageSection.Subtitle className="hidden md:block">
                      See how our community is taking a stand to safeguard the future of crypto in
                      the UK.
                    </HomePageSection.Subtitle>
                    {countUsers && actions && (
                      <DelayedRecentActivityWithMap
                        actions={actions}
                        advocatesMapPageData={advocatePerStateDataProps}
                        countUsers={countUsers.count}
                        countryCode={countryCode}
                        showDonateButton={false}
                      />
                    )}
                  </>
                ),
              },
              {
                value: GbRecentActivityAndLeaderboardTabs.TOP_CONSTITUENCIES,
                label: 'Top constituencies',
                content: (
                  <div className="space-y-4">
                    <HomePageSection.Subtitle className="hidden md:block">
                      See which constituency has the most number of advocates.
                    </HomePageSection.Subtitle>

                    <GbYourConstituencyRankingWrapper>
                      <GbYourConstituencyRankSuspense>
                        <UserAddressProvider countryCode={countryCode}>
                          <GbYourConstituencyRank />
                        </UserAddressProvider>
                      </GbYourConstituencyRankSuspense>
                    </GbYourConstituencyRankingWrapper>
                    <GbAdvocatesLeaderboard data={leaderboardData} />
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

      <HomepagePoliticiansSection
        countryCode={countryCode}
        cryptoStanceGrade={DTSIFormattedLetterGrade}
        dtsiHomepagePoliticians={dtsiHomepagePoliticians}
      />
    </>
  )
}

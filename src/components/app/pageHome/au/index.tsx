import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { AuRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/au/recentActivityAndLeaderboardTabs'
import { FoundersCarousel } from '@/components/app/pageHome/common/foundersCarousel'
import { HomePageSection } from '@/components/app/pageHome/common/homePageSectionLayout'
import { PartnerGrid } from '@/components/app/pageHome/common/partnerGrid'
import { HomepagePoliticiansSection } from '@/components/app/pageHome/common/politiciansSection'
import { TopLevelMetrics } from '@/components/app/pageHome/common/topLevelMetrics'
import { HomePageProps } from '@/components/app/pageHome/common/types'
import { AuAdvocatesLeaderboard } from '@/components/app/pageReferrals/au/leaderboard'
import {
  AuYourDivisionRank,
  AuYourDivisionRankingWrapper,
  AuYourDivisionRankSuspense,
} from '@/components/app/pageReferrals/au/yourDivisionRanking'
import { UserAddressProvider } from '@/components/app/pageReferrals/common/userAddress.context'
import { RecentActivity } from '@/components/app/recentActivity'
import { UserActionFormReferDialog } from '@/components/app/userActionFormRefer/dialog'
import { UserActionGridCTAs } from '@/components/app/userActionGridCTAs'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { ResponsiveTabsOrSelect } from '@/components/ui/responsiveTabsOrSelect'
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
  leaderboardData,
}: HomePageProps) {
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
        <HomePageSection.Title>Our community</HomePageSection.Title>
        <HomePageSection.Subtitle className="md:hidden">
          See how our community is taking a stand to safeguard the future of crypto in Australia.
        </HomePageSection.Subtitle>

        <RecentActivity>
          <ResponsiveTabsOrSelect
            analytics={'Homepage Our Community Tabs'}
            data-testid="community-leaderboard-tabs"
            defaultValue={AuRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY}
            options={[
              {
                value: AuRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
                label: 'Recent activity',
                content: (
                  <div className="space-y-4">
                    <RecentActivity.List actions={recentActivity} />
                    <RecentActivity.Footer>
                      <Button asChild variant="secondary">
                        <InternalLink href={urls.community()}>View all</InternalLink>
                      </Button>
                    </RecentActivity.Footer>
                  </div>
                ),
              },
              {
                value: AuRecentActivityAndLeaderboardTabs.TOP_DIVISIONS,
                label: 'Top divisions',
                content: (
                  <div className="space-y-4">
                    <HomePageSection.Subtitle className="hidden md:block">
                      See which division has the most number of advocates.
                    </HomePageSection.Subtitle>

                    <AuYourDivisionRankingWrapper>
                      <AuYourDivisionRankSuspense>
                        <UserAddressProvider countryCode={countryCode}>
                          <AuYourDivisionRank />
                        </UserAddressProvider>
                      </AuYourDivisionRankSuspense>
                    </AuYourDivisionRankingWrapper>
                    <AuAdvocatesLeaderboard data={leaderboardData} />
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
            We’re proud to partner with some of the most influential and forward-thinking companies
            driving innovation through blockchain and crypto.
          </HomePageSection.Subtitle>
          <div className="flex flex-col items-center gap-6">
            <PartnerGrid partners={partners} />
            <Button asChild size="lg" variant="secondary">
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

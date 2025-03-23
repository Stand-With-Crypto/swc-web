import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/sortPeople'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { HomePageSection } from '@/components/app/pageHome/common/homePageSectionLayout'
import { PartnerGrid } from '@/components/app/pageHome/common/partnerGrid'
import { TopLevelMetrics } from '@/components/app/pageHome/common/topLevelMetrics'
import { DelayedRecentActivityWithMap } from '@/components/app/pageHome/us/delayedRecentActivity'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { DistrictsLeaderboard } from '@/components/app/pageReferrals/districtsLeaderboard'
import { YourDistrictRank } from '@/components/app/pageReferrals/yourDistrictRank'
import { RecentActivity } from '@/components/app/recentActivity'
import { SumDonationsByUserRow } from '@/components/app/sumDonationsByUserRow/sumDonationsByUserRow'
import { UserActionFormReferDialog } from '@/components/app/userActionFormRefer/dialog'
import { UserActionGridCTAs } from '@/components/app/userActionGridCTAs'
import { Button } from '@/components/ui/button'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { ResponsiveTabsOrSelect } from '@/components/ui/responsiveTabsOrSelect'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { PageProps } from '@/types'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME } from '@/utils/shared/constants'
import { getIntlUrls } from '@/utils/shared/urls'
import { SWCPartners } from '@/utils/shared/zod/getSWCPartners'

import { UsHero } from './hero'

export function UsPageHome({
  params,
  sumDonations,
  countUsers,
  countPolicymakerContacts,
  actions,
  sumDonationsByUser,
  dtsiHomepagePeople,
  advocatePerStateDataProps,
  partners,
  leaderboardData,
}: { params: Awaited<PageProps['params']> } & Awaited<ReturnType<typeof getHomepageData>> & {
    advocatePerStateDataProps: Awaited<ReturnType<typeof getAdvocatesMapData>>
    partners: SWCPartners | null
    leaderboardData: DistrictRankingEntryWithRank[]
  }) {
  const { countryCode } = params
  const urls = getIntlUrls(countryCode)
  const lowestScores = sortDTSIPersonDataTable(dtsiHomepagePeople.lowestScores)
  const highestScores = sortDTSIPersonDataTable(dtsiHomepagePeople.highestScores)

  return (
    <>
      <UsHero />

      <section className="container">
        <TopLevelMetrics {...{ sumDonations, countryCode, countUsers, countPolicymakerContacts }} />
      </section>

      <HomePageSection>
        <HomePageSection.Title>Our community</HomePageSection.Title>
        <HomePageSection.Subtitle className="md:hidden">
          See how our community is taking a stand to safeguard the future of crypto in America.
        </HomePageSection.Subtitle>
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
                      See the most recent actions our community has taken to safeguard the future of
                      crypto in America.
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
                value: RecentActivityAndLeaderboardTabs.LEADERBOARD,
                label: 'Top donations',
                content: (
                  <>
                    <HomePageSection.Subtitle>
                      Donations to{' '}
                      <ExternalLink href={'https://www.fec.gov/data/committee/C00835959/'}>
                        Fairshake
                      </ExternalLink>
                      , a pro-crypto Super PAC, are not included on the leaderboard.
                    </HomePageSection.Subtitle>
                    <div className="space-y-8 lg:space-y-10">
                      {sumDonationsByUser.map((donor, index) => (
                        <SumDonationsByUserRow
                          countryCode={countryCode}
                          index={index}
                          key={index}
                          sumDonations={donor}
                        />
                      ))}
                    </div>
                    <div className="mt-7 space-x-4 text-center">
                      <Button asChild>
                        <InternalLink href={urls.donate()}>Donate</InternalLink>
                      </Button>
                      <Button asChild variant="secondary">
                        <InternalLink
                          href={urls.leaderboard({
                            tab: RecentActivityAndLeaderboardTabs.LEADERBOARD,
                          })}
                        >
                          View all
                        </InternalLink>
                      </Button>
                    </div>
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
                    <DistrictsLeaderboard countryCode={countryCode} data={leaderboardData} />
                    <div className="mx-auto flex w-fit justify-center gap-2">
                      <LoginDialogWrapper
                        authenticatedContent={
                          <UserActionFormReferDialog>
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

      <HomePageSection>
        <HomePageSection.Title>Our partners</HomePageSection.Title>
        <HomePageSection.Subtitle>
          Stand With Crypto is first and foremost the result of{' '}
          {TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME}+ people fighting to keep crypto in America.
          We've also partnered with a number of companies to fight alongside us.
        </HomePageSection.Subtitle>
        <div className="flex flex-col items-center gap-6">
          <PartnerGrid partners={partners} />
          <Button asChild variant="secondary">
            <InternalLink href={urls.partners()}>View all</InternalLink>
          </Button>
        </div>
      </HomePageSection>

      <HomePageSection>
        <HomePageSection.Title>Get involved</HomePageSection.Title>
        <HomePageSection.Subtitle>
          The future of crypto is in your hands. Here's how you can help.
        </HomePageSection.Subtitle>
        <UserActionGridCTAs />
      </HomePageSection>

      <HomePageSection className="space-y-6" container={false}>
        <div className="container">
          <HomePageSection.Title>Where politicians stand on crypto</HomePageSection.Title>
          <HomePageSection.Subtitle>
            Ask your policymakers to be pro-crypto. Here's where they stand now.
          </HomePageSection.Subtitle>
        </div>
        <div>
          <h5 className="container text-center">
            <CryptoSupportHighlight className="mx-auto mb-4" stanceScore={100} text="Pro-crypto" />
          </h5>
          <DTSIPersonHeroCardRow>
            {highestScores.map(person => (
              <DTSIPersonHeroCard
                countryCode={countryCode}
                key={person.id}
                person={person}
                subheader="role-w-state"
              />
            ))}
          </DTSIPersonHeroCardRow>
        </div>
        <div>
          <h5 className="container text-center">
            <CryptoSupportHighlight className="mx-auto mb-4" stanceScore={0} text="Anti-crypto" />
          </h5>
          <DTSIPersonHeroCardRow>
            {lowestScores.map(person => (
              <DTSIPersonHeroCard
                countryCode={countryCode}
                key={person.id}
                person={person}
                subheader="role-w-state"
              />
            ))}
          </DTSIPersonHeroCardRow>
        </div>
        <div className="container space-x-4 text-center">
          <Button asChild variant="secondary">
            <InternalLink href={urls.politiciansHomepage()}>View all</InternalLink>
          </Button>
        </div>
      </HomePageSection>
    </>
  )
}

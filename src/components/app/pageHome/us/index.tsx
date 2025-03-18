import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/sortPeople'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { TopLevelMetrics } from '@/components/app/pageHome/common/topLevelMetrics'
import { DelayedRecentActivityWithMap } from '@/components/app/pageHome/us/delayedRecentActivity'
import { PartnerGrid } from '@/components/app/pageHome/us/partnerGrid'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { DistrictsLeaderboard } from '@/components/app/pageReferrals/districtsLeaderboard'
import { YourDistrictRank } from '@/components/app/pageReferrals/yourDistrictRank'
import { SumDonationsByUserRow } from '@/components/app/sumDonationsByUserRow/sumDonationsByUserRow'
import { UserActionFormReferDialog } from '@/components/app/userActionFormRefer/dialog'
import { UserActionGridCTAs } from '@/components/app/userActionGridCTAs'
import { Button } from '@/components/ui/button'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ResponsiveTabsOrSelect } from '@/components/ui/responsiveTabsOrSelect'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { PageProps } from '@/types'
import { DistrictRankingEntryWithRank } from '@/utils/server/districtRankings/upsertRankings'
import { TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME } from '@/utils/shared/constants'
import { SWCPartners } from '@/utils/shared/getSWCPartners'
import { getIntlUrls } from '@/utils/shared/urls'

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
      <div className="container">
        <TopLevelMetrics {...{ sumDonations, countryCode, countUsers, countPolicymakerContacts }} />

        <section className="mb-16 md:mb-36">
          <PageTitle as="h3" className="mb-6 !text-[32px]">
            Our community
          </PageTitle>
          <PageSubTitle as="h4" className="mb-10 md:hidden">
            See how our community is taking a stand to safeguard the future of crypto in America.
          </PageSubTitle>

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
                    <PageSubTitle as="h4" className="mb-10 hidden md:block">
                      See the most recent actions our community has taken to safeguard the future of
                      crypto in America.
                    </PageSubTitle>
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
                    <PageSubTitle as="h4" className="mb-10">
                      Donations to{' '}
                      <ExternalLink href={'https://www.fec.gov/data/committee/C00835959/'}>
                        Fairshake
                      </ExternalLink>
                      , a pro-crypto Super PAC, are not included on the leaderboard.
                    </PageSubTitle>
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
                    <PageSubTitle as="h4" className="mb-10 hidden md:block">
                      See which district has the most number of advocates.
                    </PageSubTitle>
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
        </section>

        <section className="mb-16 text-center md:mb-36">
          <PageTitle as="h3" className="mb-6 !text-[32px]">
            Our partners
          </PageTitle>
          <PageSubTitle as="h4" className="mb-10">
            Stand With Crypto is first and foremost the result of{' '}
            {TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME}+ people fighting to keep crypto in America.
            We've also partnered with a number of companies to fight alongside us.
          </PageSubTitle>
          <div className="space-y-6">
            <PartnerGrid partners={partners} />
            <Button asChild variant="secondary">
              <InternalLink href={urls.partners()}>View all</InternalLink>
            </Button>
          </div>
        </section>

        <section className="mb-16 md:mb-36">
          <PageTitle as="h3" className="mb-6 !text-[32px]">
            Get involved
          </PageTitle>
          <PageSubTitle as="h4" className="mb-10">
            The future of crypto is in your hands. Here's how you can help.
          </PageSubTitle>
          <UserActionGridCTAs />
        </section>
      </div>

      <section className="mb-16 space-y-6 md:mb-36">
        <div className="container">
          <PageTitle as="h3" className="mb-6 !text-[32px]">
            Where politicians stand on crypto
          </PageTitle>
          <PageSubTitle as="h4" className="mb-10">
            Ask your policymakers to be pro-crypto. Here's where they stand now.
          </PageSubTitle>
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
      </section>
    </>
  )
}

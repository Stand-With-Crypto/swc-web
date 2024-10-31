import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/sortPeople'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { DelayedRecentActivityWithMap } from '@/components/app/pageHome/delayedRecentActivity'
import { HeroCTA } from '@/components/app/pageHome/heroCTA'
import { HeroImage } from '@/components/app/pageHome/heroImage'
import { PartnerGrid } from '@/components/app/pageHome/partnerGrid'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { SumDonationsByUserRow } from '@/components/app/sumDonationsByUserRow/sumDonationsByUserRow'
import { UserActionGridCTAs } from '@/components/app/userActionGridCTAs'
import { Button } from '@/components/ui/button'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { PageProps } from '@/types'
import { TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME } from '@/utils/shared/constants'
import { getIntlUrls } from '@/utils/shared/urls'

import { TopLevelMetrics } from './topLevelMetrics'

export function PageHome({
  params,
  sumDonations,
  countUsers,
  countVoterActions,
  actions,
  sumDonationsByUser,
  dtsiHomepagePeople,
  advocatePerStateDataProps,
}: PageProps &
  Awaited<ReturnType<typeof getHomepageData>> & {
    advocatePerStateDataProps: Awaited<ReturnType<typeof getAdvocatesMapData>>
  }) {
  const { locale } = params
  const urls = getIntlUrls(locale)
  const lowestScores = sortDTSIPersonDataTable(dtsiHomepagePeople.lowestScores)
  const highestScores = sortDTSIPersonDataTable(dtsiHomepagePeople.highestScores)

  return (
    <>
      <section className="grid-fl lg:standard-spacing-from-navbar mb-6 grid grid-cols-1 items-center gap-4 lg:container lg:grid-cols-2 lg:gap-8 lg:gap-y-1">
        <div className="lg:order-0 container order-1 mx-auto max-w-xl space-y-6 pt-4 text-center md:max-w-3xl lg:px-0 lg:pt-0 lg:text-left">
          <PageTitle className={'lg:text-left'} withoutBalancer>
            If you care about crypto, it's time to prove it
          </PageTitle>
          <PageSubTitle className="lg:max-w-xl lg:text-left" withoutBalancer>
            52 million Americans own crypto. And yet, crypto's future in America remains uncertain.
            Congress is writing the rules as we speak - but they won't vote YES until they've heard
            from you.
          </PageSubTitle>
          <HeroCTA />
        </div>
        <div className="order-0 self-start md:container lg:order-1 lg:px-0">
          <HeroImage locale={locale} />
        </div>
      </section>
      <div className="container">
        <TopLevelMetrics {...{ sumDonations, locale, countUsers, countVoterActions }} />

        <section className="mb-16 md:mb-36">
          <PageTitle as="h3" className="mb-6 !text-[32px]">
            Voter guide
          </PageTitle>
          <PageSubTitle as="h4" className="mb-10">
            This year’s election is critical to the future of crypto. Here’s how to become an
            informed voter.
          </PageSubTitle>
          <UserActionGridCTAs />
        </section>

        <section className="mb-16 md:mb-36">
          <PageTitle as="h3" className="mb-6 !text-[32px]">
            Our community
          </PageTitle>

          <Tabs
            analytics={'Homepage Our Community Tabs'}
            defaultValue={RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY}
          >
            <div className="mb-8 text-center lg:mb-10">
              <TabsList className="mx-auto">
                <TabsTrigger value={RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY}>
                  Recent activity
                </TabsTrigger>
                <TabsTrigger value={RecentActivityAndLeaderboardTabs.LEADERBOARD}>
                  Top donations
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY}>
              <>
                <PageSubTitle as="h4" className="mb-10">
                  See the most recent actions our community has taken to safeguard the future of
                  crypto in America.
                </PageSubTitle>
                <DelayedRecentActivityWithMap
                  actions={actions}
                  advocatesMapPageData={advocatePerStateDataProps}
                  countUsers={countUsers.count}
                  locale={locale}
                />
              </>
            </TabsContent>
            <TabsContent value={RecentActivityAndLeaderboardTabs.LEADERBOARD}>
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
                      index={index}
                      key={index}
                      locale={locale}
                      sumDonations={donor}
                    />
                  ))}
                </div>{' '}
              </>
              <div className="mt-7 space-x-4 text-center">
                <Button asChild>
                  <InternalLink href={urls.donate()}>Donate</InternalLink>
                </Button>
                <Button asChild variant="secondary">
                  <InternalLink
                    href={urls.leaderboard({ tab: RecentActivityAndLeaderboardTabs.LEADERBOARD })}
                  >
                    View all
                  </InternalLink>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
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
            <PartnerGrid />
            <Button asChild variant="secondary">
              <InternalLink href={urls.partners()}>View all</InternalLink>
            </Button>
          </div>
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
                key={person.id}
                locale={locale}
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
                key={person.id}
                locale={locale}
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

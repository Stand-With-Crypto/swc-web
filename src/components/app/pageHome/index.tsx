import { Content } from '@builder.io/react'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/sortPeople'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { HeroCTA } from '@/components/app/hero/heroCTA'
import { HeroBuilder } from '@/components/app/hero/renderHeroBuilder'
import { DelayedRecentActivityWithMap } from '@/components/app/pageHome/delayedRecentActivity'
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

export async function PageHome({
  params,
  sumDonations,
  countUsers,
  countPolicymakerContacts,
  actions,
  sumDonationsByUser,
  dtsiHomepagePeople,
  advocatePerStateDataProps,
  homeHeroContent,
}: { params: Awaited<PageProps['params']> } & Awaited<ReturnType<typeof getHomepageData>> & {
    advocatePerStateDataProps: Awaited<ReturnType<typeof getAdvocatesMapData>>
    homeHeroContent: Content
  }) {
  const { locale } = params
  const urls = getIntlUrls(locale)
  const lowestScores = sortDTSIPersonDataTable(dtsiHomepagePeople.lowestScores)
  const highestScores = sortDTSIPersonDataTable(dtsiHomepagePeople.highestScores)

  return (
    <>
      <HeroBuilder content={homeHeroContent} />
      <div className="container">
        <TopLevelMetrics {...{ sumDonations, locale, countUsers, countPolicymakerContacts }} />

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

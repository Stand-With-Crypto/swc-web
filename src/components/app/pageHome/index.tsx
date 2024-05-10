import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/sortPeople'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { DelayedRecentActivity } from '@/components/app/pageHome/delayedRecentActivity'
import { HeroCTA } from '@/components/app/pageHome/heroCTA'
import { HeroImageWrapper } from '@/components/app/pageHome/heroImage'
import { PartnerGrid } from '@/components/app/pageHome/partnerGrid'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { SumDonationsByUserRow } from '@/components/app/sumDonationsByUserRow/sumDonationsByUserRow'
import { UserActionRowCTAsAnimatedListWithApi } from '@/components/app/userActionRowCTA/userActionRowCTAsAnimatedListWithApi'
import { Button } from '@/components/ui/button'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { PageProps } from '@/types'
import { getIntlUrls } from '@/utils/shared/urls'

import { TopLevelMetrics } from './topLevelMetrics'

export function PageHome({
  params,
  sumDonations,
  countUsers,
  countPolicymakerContacts,
  actions,
  sumDonationsByUser,
  dtsiHomepagePeople,
}: PageProps & Awaited<ReturnType<typeof getHomepageData>>) {
  const { locale } = params
  const urls = getIntlUrls(locale)
  const lowestScores = sortDTSIPersonDataTable(dtsiHomepagePeople.lowestScores)
  const highestScores = sortDTSIPersonDataTable(dtsiHomepagePeople.highestScores)
  return (
    <>
      <section className="grid-fl standard-spacing-from-navbar mb-6 grid grid-cols-1 items-center gap-4 lg:container lg:grid-cols-2 lg:gap-8">
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
        <div className="order-0 md:container lg:order-1 lg:px-0">
          <HeroImageWrapper />
        </div>
      </section>
      <div className="container">
        <TopLevelMetrics {...{ sumDonations, locale, countUsers, countPolicymakerContacts }} />
        <section className="mb-16 text-center md:mb-36">
          <PageTitle as="h3" className="mb-7" size="md">
            Our mission
          </PageTitle>
          <PageSubTitle as="h4" className="mb-7">
            Stand With Crypto, a 501(c)(4) nonprofit, champions for clear, common-sense regulations
            for the crypto industry. We're mobilizing the 52 million crypto owners in the US - a
            demographic that is younger (60% Gen-Z and Millennials) and more diverse (41% identify
            as racial minorities) than the general US population - to unlock crypto's innovation
            potential and foster greater economic freedom.
          </PageSubTitle>
          <div>
            <Button asChild variant="secondary">
              <InternalLink href={urls.about()}>Learn more</InternalLink>
            </Button>
          </div>
        </section>

        <section className="mb-16 text-center md:mb-36">
          <PageTitle as="h3" className="mb-7" size="md">
            Our partners
          </PageTitle>
          <PageSubTitle as="h4" className="mb-7">
            Stand With Crypto is first and foremost the result of 400,000+ people fighting to keep
            crypto in America. We’ve also partnered with a number of companies to fight alongside
            us.
          </PageSubTitle>
          <div className="space-y-6">
            <PartnerGrid />
            <Button asChild variant="secondary">
              <InternalLink href={urls.partners()}>View all</InternalLink>
            </Button>
          </div>
        </section>

        <section className="mb-16 space-y-7 md:mb-36 xl:space-y-16">
          <PageTitle as="h3" size="md">
            Our community
          </PageTitle>
          <PageSubTitle as="h4">
            See how our community is taking a stand to safeguard the future of crypto in America.
            Donations to{' '}
            <ExternalLink href={'https://www.fec.gov/data/committee/C00835959/'}>
              Fairshake
            </ExternalLink>
            , a pro-crypto Super PAC, are not included on the leaderboard.
          </PageSubTitle>
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
            <DelayedRecentActivity actions={actions} />
            <TabsContent value={RecentActivityAndLeaderboardTabs.LEADERBOARD}>
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
        <section className="mb-16 space-y-7 md:mb-36">
          <PageTitle as="h3" size="md">
            Get involved
          </PageTitle>
          <PageSubTitle as="h4">
            The future of crypto is in your hands. Here's how you can help.
          </PageSubTitle>
          <UserActionRowCTAsAnimatedListWithApi />
        </section>
      </div>
      <section className="mb-16 space-y-16 md:mb-36">
        <div className="container">
          <PageTitle as="h3" className="mb-7" size="md">
            Where politicians stand on crypto
          </PageTitle>
          <PageSubTitle as="h4">
            Ask your policymakers to be pro-crypto. Here’s where they stand now.
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

import { Suspense } from 'react'
import { ArrowUpRight, ThumbsDown, ThumbsUp } from 'lucide-react'

import { DTSIPersonCard } from '@/components/app/dtsiPersonCard'
import { DelayedRecentActivity } from '@/components/app/pageHome/delayedRecentActivity'
import { HeroCTA } from '@/components/app/pageHome/heroCTA'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { SumDonationsByUserRow } from '@/components/app/sumDonationsByUserRow/sumDonationsByUserRow'
import { UserActionRowCTAsListWithApi } from '@/components/app/userActionRowCTA/userActionRowCTAsListWithApi'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { NextImage } from '@/components/ui/image'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { LazyResponsiveYoutube } from '@/components/ui/responsiveYoutube/lazyLoad'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { groupAndSortDTSIPeopleByCryptoStance } from '@/utils/dtsi/dtsiPersonUtils'
import { getIntlUrls } from '@/utils/shared/urls'

import { TopLevelMetrics } from './topLevelMetrics'

import { PageProps } from '@/types'

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
  const groupedDTSIHomepagePeople = groupAndSortDTSIPeopleByCryptoStance(dtsiHomepagePeople.people)
  return (
    <>
      <section className="grid-fl mb-6 grid grid-cols-1 items-center gap-4 lg:container lg:grid-cols-2 lg:gap-8">
        <div className="lg:order-0 container order-1 mx-auto max-w-xl space-y-6 text-center md:max-w-3xl lg:px-0 lg:text-left">
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
          <Dialog
            analytics={{ Category: 'Homepage Hero Section', CTA: '2023-12-11 Presidential Forum' }}
          >
            <DialogTrigger asChild>
              <LinkBox className="relative h-[320px] cursor-pointer overflow-hidden md:rounded-xl lg:h-[400px]">
                <NextImage
                  alt="First in the Nation Crypto Presidential Forum December 11th 2023 St. Anselm College"
                  className="h-full w-full object-cover"
                  fill
                  priority
                  // width={1046}
                  // height={892}
                  sizes={'(max-width: 768px) 500px, 1046px'}
                  src="/homepageHero.jpg"
                />
                <div
                  className="absolute bottom-0 flex w-full items-center justify-between gap-4 p-4 text-sm text-white"
                  style={{
                    background:
                      'linear-gradient(to top, hsla(0, 0%, 0%, 0.8) 10%, hsla(0, 0%, 0%, 0.4) 70%,  transparent 100%)',
                  }}
                >
                  <p>
                    First in the Nation Crypto Presidential Forum December 11th 2023 St. Anselm
                    College
                  </p>
                  <Button
                    className={linkBoxLinkClassName}
                    data-link-box-subject
                    variant="secondary"
                  >
                    Watch <ArrowUpRight />
                  </Button>
                </div>
              </LinkBox>
            </DialogTrigger>
            <DialogContent className="w-full max-w-7xl md:p-14">
              <Suspense fallback={<Skeleton className="h-20 w-full" />}>
                <LazyResponsiveYoutube videoId="uETMq54w45Y" />
              </Suspense>
            </DialogContent>
          </Dialog>
        </div>
      </section>
      <div className="container">
        <TopLevelMetrics {...{ sumDonations, locale, countUsers, countPolicymakerContacts }} />
        <section className="mb-16 text-center md:mb-24">
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
        <section className="mb-16 space-y-7 md:mb-24">
          <PageTitle as="h3" size="md">
            Our community
          </PageTitle>
          <PageSubTitle as="h4">
            See how our community is taking a stand to safeguard the future of crypto in America.
          </PageSubTitle>
          <Tabs
            analytics={'Homepage Our Community Tabs'}
            defaultValue={RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY}
          >
            <div className="text-center">
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
              <p className="mt-2 h-8 text-center text-xs text-gray-500 lg:h-10">
                Donations to{' '}
                <ExternalLink
                  href={
                    'https://www.axios.com/2023/12/18/crypto-super-pac-fairshake-2024-elections'
                  }
                >
                  Fairshake
                </ExternalLink>
                , a pro-crypto Super PAC, are not included on the leaderboard.
              </p>
              <div className="space-y-8 lg:space-y-10">
                {sumDonationsByUser.map((donor, index) => (
                  <SumDonationsByUserRow
                    index={index}
                    key={index}
                    locale={locale}
                    sumDonations={donor}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
          <div className="space-x-4 text-center">
            <Button asChild>
              <InternalLink href={urls.donate()}>Donate</InternalLink>
            </Button>
            <Button asChild variant="secondary">
              <InternalLink href={urls.leaderboard()}>View all</InternalLink>
            </Button>
          </div>
          <div></div>
        </section>
        <section className="mb-16 space-y-7 md:mb-24">
          <PageTitle as="h3" size="md">
            Get involved
          </PageTitle>
          <PageSubTitle as="h4">
            The future of crypto is in your hands. Here's how you can help.
          </PageSubTitle>
          <UserActionRowCTAsListWithApi />
        </section>
        <section className="mb-16 space-y-7 md:mb-24">
          <PageTitle as="h3" size="md">
            Where politicians stand on crypto
          </PageTitle>
          <PageSubTitle as="h4">
            Ask your policymakers to be pro-crypto. Here’s where they stand now.
          </PageSubTitle>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="text-center">
                <h5 className="mb-4 inline-flex gap-2 rounded-lg bg-green-100 p-3 text-center text-xl font-semibold text-green-600">
                  <ThumbsUp />
                  <div> Pro-crypto</div>
                </h5>
              </div>
              <div className="space-y-3">
                {groupedDTSIHomepagePeople.proCrypto.map(person => (
                  <DTSIPersonCard key={person.id} locale={locale} person={person} />
                ))}
              </div>
            </div>
            <div>
              <div className="text-center">
                <h5 className="mb-4 inline-flex gap-2 rounded-lg bg-red-100 p-3 text-center text-xl font-semibold text-red-600">
                  <ThumbsDown />
                  <div> Anti-crypto</div>
                </h5>
              </div>
              <div className="space-y-3">
                {groupedDTSIHomepagePeople.antiCrypto.map(person => (
                  <DTSIPersonCard key={person.id} locale={locale} person={person} />
                ))}
              </div>
            </div>
          </div>
          <div className="space-x-4 text-center">
            <Button asChild variant="secondary">
              <InternalLink href={urls.politiciansHomepage()}>View all</InternalLink>
            </Button>
          </div>
        </section>
      </div>
    </>
  )
}

import { AccountAuthButton } from '@/components/app/accountAuth/context'
import { DTSIPersonCard } from '@/components/app/dtsiPersonCard'
import { RecentActivityAndLeaderboard } from '@/components/app/pageHome/recentActivityAndLeaderboard'
import { UserActionRowCTAsListWithApi } from '@/components/app/userActionRowCTA/userActionRowCTAsListWithApi'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { LazyResponsiveYoutube } from '@/components/ui/responsiveYoutube/lazyLoad'
import { Skeleton } from '@/components/ui/skeleton'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { PageProps } from '@/types'
import { groupAndSortDTSIPeopleByCryptoStance } from '@/utils/dtsi/dtsiPersonUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { ArrowUpRight, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Suspense } from 'react'
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
  const groupedDTSIHomepagePeople = groupAndSortDTSIPeopleByCryptoStance(dtsiHomepagePeople.people)
  return (
    <>
      <section className="grid-fl mb-6 grid grid-cols-1 items-center gap-4 lg:container lg:grid-cols-2">
        <div className="lg:order-0 container order-1 space-y-6 text-center lg:px-0 lg:text-left">
          <PageTitle className={'text-left'} withoutBalancer>
            If you care about crypto, it's time to prove it
          </PageTitle>
          <PageSubTitle className="max-w-xl text-left" withoutBalancer>
            52 million Americans own crypto. And yet, crypto's future in America remains uncertain.
            Congress is writing the rules as we speak - but they won't vote YES until they've heard
            from you.
          </PageSubTitle>
          <AccountAuthButton size="lg">Join the fight</AccountAuthButton>
        </div>
        <div className="order-0 md:container lg:order-1 lg:px-0">
          <Dialog>
            <DialogTrigger asChild>
              <LinkBox className="relative h-[320px] cursor-pointer overflow-hidden md:rounded-xl lg:h-[400px]">
                <NextImage
                  priority
                  alt="First in the Nation Crypto Presidential Forum December 11th 2023 St. Anselm College"
                  src="/homepageHero.jpg"
                  fill
                  // width={1046}
                  // height={892}
                  className="h-full w-full object-cover"
                  sizes={'(max-width: 768px) 500px, 1046px'}
                />
                <div
                  style={{
                    background:
                      'linear-gradient(to top, hsla(0, 0%, 0%, 0.8) 10%, hsla(0, 0%, 0%, 0.4) 70%,  transparent 100%)',
                  }}
                  className="absolute bottom-0 flex w-full items-center justify-between gap-4 p-4 text-sm text-white"
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
          <PageTitle as="h3" size="md" className="mb-7">
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
            <Button variant="secondary" asChild>
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
          <RecentActivityAndLeaderboard {...{ locale, actions, sumDonationsByUser }} />
          <div className="space-x-4 text-center">
            <Button asChild>
              <InternalLink href={urls.donate()}>Donate</InternalLink>
            </Button>
            <Button variant="secondary" asChild>
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
                  <DTSIPersonCard locale={locale} key={person.id} person={person} />
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
                  <DTSIPersonCard locale={locale} key={person.id} person={person} />
                ))}
              </div>
            </div>
          </div>
          <div className="space-x-4 text-center">
            <Button variant="secondary" asChild>
              <InternalLink href={urls.politiciansHomepage()}>View all</InternalLink>
            </Button>
          </div>
        </section>
      </div>
    </>
  )
}

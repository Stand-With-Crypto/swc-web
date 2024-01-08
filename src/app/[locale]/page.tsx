import { RecentActivityAndLeaderboard } from '@/components/app/recentActivityAndLeaderboard/recentActivityAndLeaderboard'
import { UserActionRowCTAsListWithApi } from '@/components/app/userActionRowCTA/userActionRowCTAsListWithApi'
import { Button } from '@/components/ui/button'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { NextImage } from '@/components/ui/image'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { getCountPolicymakerContacts } from '@/data/aggregations/getCountPolicymakerContacts'
import { getCountUsers } from '@/data/aggregations/getCountUsers'
import { getSumDonations } from '@/data/aggregations/getSumDonations'
import { getSumDonationsByUser } from '@/data/aggregations/getSumDonationsByUser'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { PageProps } from '@/types'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { getIntlUrls } from '@/utils/shared/urls'
import { queryDTSIHomepagePeople } from '@/data/dtsi/queries/queryDTSIHomepagePeople'
import { groupAndSortDTSIPeopleByCryptoStance } from '@/utils/dtsi/dtsiPersonUtils'
import { DTSIPersonCard } from '@/components/app/dtsiPersonCard'
import { cn } from '@/utils/web/cn'
import { InternalLink } from '@/components/ui/link'
import { LazyUserActionFormOptInSWC } from '@/components/app/userActionFormOptInSWC/lazyLoad'
import { Suspense } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { ResponsiveYoutube } from '@/components/ui/responsiveYoutube'
import { LazyResponsiveYoutube } from '@/components/ui/responsiveYoutube/lazyLoad'
import { Skeleton } from '@/components/ui/skeleton'
import { UserActionFormOptInSWCDialog } from '@/components/app/userActionFormOptInSWC/dialog'

export const revalidate = 3600
export const dynamic = 'error'

export default async function Home({ params }: PageProps) {
  const { locale } = params
  const [
    actions,
    sumDonationsByUser,
    sumDonations,
    countUsers,
    countPolicymakerContacts,
    dtsiHomepagePeople,
  ] = await Promise.all([
    getPublicRecentActivity({ limit: 10 }),
    getSumDonationsByUser({ limit: 10 }),
    getSumDonations(),
    getCountUsers(),
    getCountPolicymakerContacts(),
    queryDTSIHomepagePeople(),
  ])
  const urls = getIntlUrls(locale)
  const groupedDTSIHomepagePeople = groupAndSortDTSIPeopleByCryptoStance(dtsiHomepagePeople.people)
  return (
    <>
      <section className="grid-fl mb-6 grid grid-cols-1 items-center gap-4 lg:container lg:grid-cols-2">
        <div className="lg:order-0 container order-1 space-y-6 text-center lg:max-w-[405px] lg:px-0 lg:text-left">
          <h1 className={'text-3xl font-bold md:text-4xl lg:text-5xl'}>
            If you care about crypto, it's time to prove it
          </h1>
          <h2 className="mx-auto max-w-xl text-sm text-gray-500 lg:text-base">
            52 million Americans own crypto. And yet, crypto's future in America remains uncertain.
            Congress is writing the rules as we speak - but they won't vote YES until they've heard
            from you.
          </h2>
          <UserActionFormOptInSWCDialog>
            <Button size="lg">Join the fight</Button>
          </UserActionFormOptInSWCDialog>
        </div>
        <div className="order-0 md:container lg:order-1 lg:px-0">
          <Dialog>
            <DialogTrigger asChild>
              <LinkBox className="relative h-[320px] cursor-pointer overflow-hidden md:rounded-xl lg:h-[400px]">
                <NextImage
                  priority
                  alt="First in the Nation Crypto Presidential Forum December 11th 2023 St. Anselm College"
                  src="/homepageHero.png"
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
                    Watch
                  </Button>
                </div>
              </LinkBox>
            </DialogTrigger>
            <DialogContent className="w-full max-w-7xl md:p-10">
              <Suspense fallback={<Skeleton className="h-20 w-full" />}>
                <LazyResponsiveYoutube videoId="uETMq54w45Y" />
              </Suspense>
            </DialogContent>
          </Dialog>
        </div>
      </section>
      <div className="container">
        <section className="mb-16 flex flex-col gap-3 rounded-lg text-center sm:flex-row sm:gap-0 md:mb-24">
          {[
            {
              label: 'Donated by crypto advocates',
              value: (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <FormattedCurrency
                        amount={sumDonations.amountUsd + 78000000}
                        currencyCode={SupportedFiatCurrencyCodes.USD}
                        locale={locale}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm font-normal tracking-normal">
                        Total includes donations to the Stand With Crypto Alliance nonprofit and to
                        the Fairshake Super PAC and its affiliates
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ),
            },
            {
              label: 'Crypto advocates',
              value: <FormattedNumber locale={locale} amount={countUsers.count} />,
            },
            {
              label: 'Policymaker contacts',
              value: (
                <FormattedNumber
                  locale={locale}
                  amount={
                    countPolicymakerContacts.countUserActionCalls +
                    countPolicymakerContacts.countUserActionEmailRecipients
                  }
                />
              ),
            },
          ].map(({ label, value }, index) => (
            <div
              className={cn(
                'w-full flex-shrink-0 rounded-lg bg-blue-50 p-6 sm:w-1/3',
                index === 0
                  ? 'rounded-none sm:rounded-l-lg'
                  : index === 2
                    ? 'rounded-none sm:rounded-r-lg'
                    : 'rounded-none',
              )}
              key={label}
            >
              <div className="text-xl font-bold tracking-wider">{value}</div>
              <div className="text-gray-500">{label}</div>
            </div>
          ))}
        </section>
        <section className="mb-16 text-center md:mb-24">
          <PageTitle as="h3" className="mb-7">
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
          <PageTitle as="h3">Our community</PageTitle>
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
          <PageTitle as="h3">Get involved</PageTitle>
          <PageSubTitle as="h4">
            The future of crypto is in your hands. Here's how you can help.
          </PageSubTitle>
          <UserActionRowCTAsListWithApi />
        </section>
        <section className="mb-16 space-y-7 md:mb-24">
          <PageTitle as="h3">Where politicians stand on crypto</PageTitle>
          <PageSubTitle as="h4">
            Ask your politician to be pro-crypto. Here's where they stand now.
          </PageSubTitle>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h5 className="mb-4 text-center text-xl font-bold text-green-600">Pro-crypto</h5>
              <div className="space-y-3">
                {groupedDTSIHomepagePeople.proCrypto.map(person => (
                  <DTSIPersonCard locale={locale} key={person.id} person={person} />
                ))}
              </div>
            </div>
            <div>
              <h5 className="mb-4 text-center text-xl font-bold text-red-600">Anti-crypto</h5>
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

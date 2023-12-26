import { RecentActivityAndLeaderboard } from '@/app/[locale]/recentActivityAndLeaderboard'
import { ClientAuthUserActionRowCTAs } from '@/components/app/userActionRowCTA/clientAuthUserActionRowCTAs'
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

export const revalidate = 3600
export const dynamic = 'error'

// TODO metadata

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
  const groupedDTSIHomepagePeople = groupAndSortDTSIPeopleByCryptoStance(dtsiHomepagePeople.people)
  return (
    <div className="container">
      <section className="mb-6 grid grid-cols-1 items-center md:grid-cols-2">
        <div>
          <h1 className={'mb-6 text-3xl font-bold md:text-4xl lg:text-5xl'}>
            If you care about crypto, it's time to prove it
          </h1>
          <PageSubTitle className="text-left">
            52 million Americans own crypto. And yet, crypto's future in America remains uncertain.
            Congress is writing the rules as we speak - but they won't vote YES until they've heard
            from you.
          </PageSubTitle>
        </div>
        <div className="relative overflow-hidden rounded-xl">
          {/* TODO make actual video */}
          <NextImage
            priority
            alt="First in the Nation Crypto Presidential Forum December 11th 2023 St. Anselm College"
            src="/homepageHero.png"
            width={1046}
            height={892}
            sizes={'(max-width: 768px) 500px, 1046px'}
          />
          <div className="absolute bottom-0 flex justify-between gap-4 p-4 font-bold text-white">
            <p>
              First in the Nation Crypto Presidential Forum December 11th 2023 St. Anselm College
            </p>
            <Button variant="secondary">Watch</Button>
          </div>
        </div>
      </section>
      <section className="mb-24 grid grid-cols-3 rounded-lg bg-blue-50 p-6 text-center">
        {[
          {
            label: 'Donated by crypto advocates',
            value: (
              <FormattedCurrency
                amount={sumDonations.amountUsd}
                currencyCode={SupportedFiatCurrencyCodes.USD}
                locale={locale}
              />
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
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="text-gray-700">{label}</div>
            <div className="text-xl font-bold">{value}</div>
          </div>
        ))}
      </section>
      <section className="mb-24 text-center">
        <PageTitle as="h3" className="mb-7">
          Our mission
        </PageTitle>
        <PageSubTitle as="h4" className="mb-7">
          Stand With Crypto, a 501(c)(4) nonprofit, champions for clear, common-sense regulations
          for the crypto industry. We’re mobilizing the 52 million crypto owners in the US – a
          demographic that is younger (60% Gen-Z and Millennials) and more diverse (41% identify as
          racial minorities) than the general US population – to unlock crypto’s innovation
          potential and foster greater economic freedom.
        </PageSubTitle>
        <div>
          <Button>Learn more</Button>
        </div>
      </section>
      <section className="mb-24 space-y-7">
        <PageTitle as="h3">Our community</PageTitle>
        <PageSubTitle as="h4">
          See how our community is taking a stand to safeguard the future of crypto in America.
        </PageSubTitle>
        <RecentActivityAndLeaderboard {...{ locale, actions, sumDonationsByUser }} />
        <div className="space-x-4 text-center">
          <Button>Donate</Button>
          <Button variant="secondary">View All</Button>
        </div>
        <div></div>
      </section>
      <section className="mb-24 space-y-7">
        <PageTitle as="h3">Get involved</PageTitle>
        <PageSubTitle as="h4">
          The future of crypto is in your hands. Here’s how you can help.
        </PageSubTitle>
        <ClientAuthUserActionRowCTAs />
      </section>
      <section className="mb-24 space-y-7">
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
              {/* TODO replace with anti-crypto once we get the gql endpoint working as expected */}
              {groupedDTSIHomepagePeople.antiCrypto.map(person => (
                <DTSIPersonCard locale={locale} key={person.id} person={person} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

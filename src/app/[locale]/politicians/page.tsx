import { ClientCurrentUserDTSIPersonCardOrCTA } from '@/components/app/clientCurrentUserDTSIPersonCardOrCTA'
import { DTSIClientPersonDataTable } from '@/components/app/dtsiClientPersonDataTable'
import { DTSIPersonCard } from '@/components/app/dtsiPersonCard'
import { Button } from '@/components/ui/button'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { queryDTSIHomepagePeople } from '@/data/dtsi/queries/queryDTSIHomepagePeople'
import { PageProps } from '@/types'
import { groupAndSortDTSIPeopleByCryptoStance } from '@/utils/dtsi/dtsiPersonUtils'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { Metadata } from 'next'

export const revalidate = 3600
export const dynamic = 'error'

type Props = PageProps

const title = 'Find out where politician stand on crypto'
const description = `Crypto drives American innovation. Keeping crypto in America means securing 4 million jobs over the next 7 years to increase economic mobility. Discover the politicians fighting to keep crypto in America.`
export async function generateMetadata(_props: Props): Promise<Metadata> {
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function PoliticiansHomepage({ params }: PageProps) {
  const { locale } = params
  const [dtsiHomepagePeople] = await Promise.all([queryDTSIHomepagePeople()])
  const groupedDTSIHomepagePeople = groupAndSortDTSIPeopleByCryptoStance(dtsiHomepagePeople.people)
  return (
    <div className="container">
      <section className="mb-16 space-y-7 text-center md:mb-24">
        <PageTitle>{title}</PageTitle>
        <PageSubTitle>{description}</PageSubTitle>
        <ClientCurrentUserDTSIPersonCardOrCTA locale={locale} />
      </section>
      <section className="mb-16 grid grid-cols-1 gap-4 md:mb-24 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-center text-xl font-bold text-green-600">Pro-crypto</h3>
          <div className="space-y-3">
            {groupedDTSIHomepagePeople.proCrypto.map(person => (
              <DTSIPersonCard locale={locale} key={person.id} person={person} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-center text-xl font-bold text-red-600">Anti-crypto</h3>
          <div className="space-y-3">
            {groupedDTSIHomepagePeople.antiCrypto.map(person => (
              <DTSIPersonCard locale={locale} key={person.id} person={person} />
            ))}
          </div>
        </div>
      </section>
      <section>
        <h3 className="mb-4 text-center text-xl font-bold">Politicians</h3>
        <DTSIClientPersonDataTable locale={locale} />
      </section>
    </div>
  )
}

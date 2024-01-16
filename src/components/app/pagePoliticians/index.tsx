import { ClientCurrentUserDTSIPersonCardOrCTA } from '@/components/app/clientCurrentUserDTSIPersonCardOrCTA'
import { DTSIClientPersonDataTable } from '@/components/app/dtsiClientPersonDataTable'
import { DTSIPersonCard } from '@/components/app/dtsiPersonCard'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_HomepagePeopleQuery } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { groupAndSortDTSIPeopleByCryptoStance } from '@/utils/dtsi/dtsiPersonUtils'

export const PAGE_POLITICIANS_TITLE = 'Find out where politicians stand on crypto'
export const PAGE_POLITICIANS_DESCRIPTION = `Crypto drives American innovation. Keeping crypto in America means securing 4 million jobs over the next 7 years to increase economic mobility. Discover the politicians fighting to keep crypto in America.`

export function PagePoliticians({
  dtsiHomepagePeople,
  locale,
}: {
  dtsiHomepagePeople: DTSI_HomepagePeopleQuery
  locale: SupportedLocale
}) {
  const groupedDTSIHomepagePeople = groupAndSortDTSIPeopleByCryptoStance(dtsiHomepagePeople.people)
  return (
    <div className="container">
      <section className="mb-16 space-y-7 text-center md:mb-24">
        <PageTitle>{PAGE_POLITICIANS_TITLE}</PageTitle>
        <PageSubTitle>{PAGE_POLITICIANS_DESCRIPTION}</PageSubTitle>
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

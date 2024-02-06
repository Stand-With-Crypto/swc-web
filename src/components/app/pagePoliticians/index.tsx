import { ClientCurrentUserDTSIPersonCardOrCTA } from '@/components/app/clientCurrentUserDTSIPersonCardOrCTA'
import { DTSIClientPersonDataTable } from '@/components/app/dtsiClientPersonDataTable'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_HomepagePeopleQuery } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'

export const PAGE_POLITICIANS_TITLE = 'Find out where politicians stand on crypto'
export const PAGE_POLITICIANS_DESCRIPTION = `Crypto drives American innovation. Keeping crypto in America means securing 4 million jobs over the next 7 years to increase economic mobility. Discover the politicians fighting to keep crypto in America.`

export function PagePoliticians({
  dtsiHomepagePeople,
  locale,
}: {
  dtsiHomepagePeople: DTSI_HomepagePeopleQuery
  locale: SupportedLocale
}) {
  return (
    <>
      <section className="container mb-16 space-y-7 text-center">
        <PageTitle>{PAGE_POLITICIANS_TITLE}</PageTitle>
        <PageSubTitle>{PAGE_POLITICIANS_DESCRIPTION}</PageSubTitle>
        <ClientCurrentUserDTSIPersonCardOrCTA locale={locale} />
      </section>
      <section>
        <DTSIClientPersonDataTable initialData={dtsiHomepagePeople.people} locale={locale} />
      </section>
    </>
  )
}

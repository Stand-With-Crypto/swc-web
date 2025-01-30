import { ClientCurrentUserDTSIPersonCardOrCTA } from '@/components/app/clientCurrentUserDTSIPersonCardOrCTA'
import { DTSIClientPersonDataTable } from '@/components/app/dtsiClientPersonDataTable'
import { DTSIPersonDataTablePeople } from '@/components/app/dtsiClientPersonDataTable/sortPeople'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const PAGE_POLITICIANS_TITLE = 'Find out where politicians stand on crypto'
export const PAGE_POLITICIANS_DESCRIPTION = `Crypto drives American innovation. Keeping crypto in America means securing 4 million jobs over the next 7 years to increase economic mobility. Discover the politicians fighting to keep crypto in America.`

export function PagePoliticians({
  people,
  countryCode,
}: {
  people: DTSIPersonDataTablePeople
  countryCode: SupportedCountryCodes
}) {
  return (
    <>
      <section className="standard-spacing-from-navbar container mb-16 space-y-7">
        <PageTitle>{PAGE_POLITICIANS_TITLE}</PageTitle>
        <PageSubTitle>{PAGE_POLITICIANS_DESCRIPTION}</PageSubTitle>
        <ClientCurrentUserDTSIPersonCardOrCTA countryCode={countryCode} />
      </section>
      <section>
        <DTSIClientPersonDataTable initialData={people} />
      </section>
    </>
  )
}

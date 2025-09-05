import { ClientCurrentUserDTSIPersonCardOrCTA } from '@/components/app/clientCurrentUserDTSIPersonCardOrCTA'
import { AuDTSIClientPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/au'
import { DTSIPersonDataTablePeople } from '@/components/app/dtsiClientPersonDataTable/common/utils'
import { PagePoliticiansLayout } from '@/components/app/pagePoliticians/common/layout'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory/au'

export const PAGE_POLITICIANS_TITLE = 'Find out where politicians stand on crypto'
export const PAGE_POLITICIANS_DESCRIPTION = `Crypto drives Australian innovation. Discover the politicians fighting to keep crypto in Australia.`
const POLITICIAN_CATEGORY: YourPoliticianCategory = 'senate-and-house'

const countryCode = SupportedCountryCodes.AU

export function AuPagePoliticians({ politicians }: { politicians: DTSIPersonDataTablePeople }) {
  return (
    <PagePoliticiansLayout>
      <PagePoliticiansLayout.IntroductionSection>
        <PageTitle>{PAGE_POLITICIANS_TITLE}</PageTitle>
        <PageSubTitle>{PAGE_POLITICIANS_DESCRIPTION}</PageSubTitle>
        <ClientCurrentUserDTSIPersonCardOrCTA
          category={POLITICIAN_CATEGORY}
          countryCode={countryCode}
        />
      </PagePoliticiansLayout.IntroductionSection>
      <PagePoliticiansLayout.PoliticiansTableSection>
        <AuDTSIClientPersonDataTable initialData={politicians} />
      </PagePoliticiansLayout.PoliticiansTableSection>
    </PagePoliticiansLayout>
  )
}

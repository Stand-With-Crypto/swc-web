import { ClientCurrentUserDTSIPersonCardOrCTA } from '@/components/app/clientCurrentUserDTSIPersonCardOrCTA'
import { DTSIPersonDataTablePeople } from '@/components/app/dtsiClientPersonDataTable/common/utils'
import { GbDTSIClientPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/gb'
import { PagePoliticiansLayout } from '@/components/app/pagePoliticians/common/layout'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory/gb'

export const PAGE_POLITICIANS_TITLE = 'Find out where politicians stand on crypto'
export const PAGE_POLITICIANS_DESCRIPTION = `Crypto drives British innovation. Discover the politicians fighting to keep crypto in the UK.`
const POLITICIAN_CATEGORY: YourPoliticianCategory = 'mp'

const countryCode = SupportedCountryCodes.GB

export function GbPagePoliticians({ politicians }: { politicians: DTSIPersonDataTablePeople }) {
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
        <GbDTSIClientPersonDataTable initialData={politicians} />
      </PagePoliticiansLayout.PoliticiansTableSection>
    </PagePoliticiansLayout>
  )
}

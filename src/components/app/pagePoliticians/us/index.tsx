import { ClientCurrentUserDTSIPersonCardOrCTA } from '@/components/app/clientCurrentUserDTSIPersonCardOrCTA'
import { DTSIPersonDataTablePeople } from '@/components/app/dtsiClientPersonDataTable/common/utils'
import { UsDTSIClientPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/us'
import { PagePoliticiansLayout } from '@/components/app/pagePoliticians/common/layout'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory/us'

export const PAGE_POLITICIANS_TITLE = 'Find out where politicians stand on crypto'
export const PAGE_POLITICIANS_DESCRIPTION = `Crypto drives American innovation. Keeping crypto in America means securing 4 million jobs over the next 7 years to increase economic mobility. Discover the politicians fighting to keep crypto in America.`
const POLITICIAN_CATEGORY: YourPoliticianCategory = 'legislative-and-executive'

const countryCode = SupportedCountryCodes.US

export function UsPagePoliticians({ politicians }: { politicians: DTSIPersonDataTablePeople }) {
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
        <UsDTSIClientPersonDataTable initialData={politicians} />
      </PagePoliticiansLayout.PoliticiansTableSection>
    </PagePoliticiansLayout>
  )
}

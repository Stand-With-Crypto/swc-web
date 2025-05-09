import { CaDTSIClientPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/ca'
import { DTSIPersonDataTablePeople } from '@/components/app/dtsiClientPersonDataTable/common/utils'
import { PagePoliticiansLayout } from '@/components/app/pagePoliticians/common/layout'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

export const PAGE_POLITICIANS_TITLE = 'Find out where politicians stand on crypto'
export const PAGE_POLITICIANS_DESCRIPTION = `Crypto drives Canada innovation. Find out how political leaders have addressed crypto issues.`

export function CaPagePoliticians({ politicians }: { politicians: DTSIPersonDataTablePeople }) {
  return (
    <PagePoliticiansLayout>
      <PagePoliticiansLayout.IntroductionSection>
        <PageTitle>{PAGE_POLITICIANS_TITLE}</PageTitle>
        <PageSubTitle>{PAGE_POLITICIANS_DESCRIPTION}</PageSubTitle>
      </PagePoliticiansLayout.IntroductionSection>
      <PagePoliticiansLayout.PoliticiansTableSection>
        <CaDTSIClientPersonDataTable initialData={politicians} />
      </PagePoliticiansLayout.PoliticiansTableSection>
    </PagePoliticiansLayout>
  )
}

import { DTSIPersonDataTablePeople } from '@/components/app/dtsiClientPersonDataTable/common/sortPeople'
import { GbDTSIClientPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/gb'
import { PagePoliticiansLayout } from '@/components/app/pagePoliticians/common/layout'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

export const PAGE_POLITICIANS_TITLE = 'Find out where politicians stand on crypto'
export const PAGE_POLITICIANS_DESCRIPTION = `Crypto drives British innovation. Discover the politicians fighting to keep crypto in Britain.`

export function GbPagePoliticians({ politicians }: { politicians: DTSIPersonDataTablePeople }) {
  return (
    <PagePoliticiansLayout>
      <PagePoliticiansLayout.IntroductionSection>
        <PageTitle>{PAGE_POLITICIANS_TITLE}</PageTitle>
        <PageSubTitle>{PAGE_POLITICIANS_DESCRIPTION}</PageSubTitle>
      </PagePoliticiansLayout.IntroductionSection>
      <PagePoliticiansLayout.PoliticiansTableSection>
        <GbDTSIClientPersonDataTable initialData={politicians} />
      </PagePoliticiansLayout.PoliticiansTableSection>
    </PagePoliticiansLayout>
  )
}

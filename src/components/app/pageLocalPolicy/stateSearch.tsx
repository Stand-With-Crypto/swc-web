import { StateSearchComponent } from '@/components/app/pageLocalPolicy/stateSearchComponent'
import { StateSearchProps } from '@/components/app/pageLocalPolicy/types'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

const STATE_SEARCH_TITLE = 'Explore local policy'
const STATE_SEARCH_DESCRIPTION =
  'View bills, local elections, and find out where politicians in your state stand on crypto'

export function StateSearch(props: StateSearchProps) {
  return (
    <div className="container mb-16 space-y-7">
      <PageTitle>{STATE_SEARCH_TITLE}</PageTitle>
      <PageSubTitle>{STATE_SEARCH_DESCRIPTION}</PageSubTitle>

      <StateSearchComponent {...props} />
    </div>
  )
}

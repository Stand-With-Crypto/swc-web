import { SearchResult } from '@/components/app/pageLocalPolicy/common/searchResult'
import { StateCard } from '@/components/app/pageLocalPolicy/common/stateCard'
import {
  IntlUrls,
  SearchResult as SearchResultType,
} from '@/components/app/pageLocalPolicy/common/types'
import { getStateNameResolver } from '@/utils/shared/stateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const STATE_RESULT_TITLE = 'Your state'
const STATE_RESULT_BUTTON_LABEL = 'View local policy'

interface UsSearchResultProps {
  countryCode: SupportedCountryCodes
  searchResult: SearchResultType
  urls: IntlUrls
}

export function UsSearchResult({ countryCode, searchResult, urls }: UsSearchResultProps) {
  if (!searchResult) {
    return null
  }

  const stateCode = searchResult.administrativeAreaLevel1
  const stateName = getStateNameResolver(countryCode)(stateCode)

  return (
    <SearchResult>
      <SearchResult.Title>{STATE_RESULT_TITLE}</SearchResult.Title>

      <StateCard>
        <StateCard.Shield countryCode={countryCode} stateCode={stateCode} />
        <StateCard.Title>{stateName}</StateCard.Title>
        <StateCard.Button href={urls.localPolicy(stateCode)}>
          {STATE_RESULT_BUTTON_LABEL}
        </StateCard.Button>
      </StateCard>
    </SearchResult>
  )
}

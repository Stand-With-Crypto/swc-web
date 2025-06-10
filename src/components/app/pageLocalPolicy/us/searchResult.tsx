import { SearchResult } from '@/components/app/pageLocalPolicy/common/searchResult'
import { StateCard } from '@/components/app/pageLocalPolicy/common/stateCard'
import { SearchResult as SearchResultType } from '@/components/app/pageLocalPolicy/common/types'
import { getStateNameResolver } from '@/utils/shared/stateUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const STATE_RESULT_TITLE = 'Your state'
const STATE_RESULT_BUTTON_LABEL = 'View local policy'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

const urls = getIntlUrls(countryCode)

interface UsSearchResultProps {
  searchResult: SearchResultType
}

export function UsSearchResult({ searchResult }: UsSearchResultProps) {
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

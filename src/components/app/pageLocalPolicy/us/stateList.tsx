import { useMemo } from 'react'

import { StateList } from '@/components/app/pageLocalPolicy/common/stateList'
import { SearchResult } from '@/components/app/pageLocalPolicy/common/types'
import { US_MAIN_STATE_CODE_WITH_DC_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/usStateUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const STATE_LIST_TITLE = 'Explore other states'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

const urls = getIntlUrls(countryCode)

interface UsStateListProps {
  searchResult: SearchResult
}

export function UsStateList({ searchResult }: UsStateListProps) {
  const otherStates = useMemo(() => {
    const statesList = Object.entries(US_MAIN_STATE_CODE_WITH_DC_TO_DISPLAY_NAME_MAP)
      .map(([code, name]) => ({
        code,
        name,
        url: urls.localPolicy(code),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    if (!searchResult) {
      return statesList
    }

    const currentStateCode = searchResult.administrativeAreaLevel1

    return statesList.filter(({ code }) => code !== currentStateCode)
  }, [searchResult])

  return (
    <StateList>
      {searchResult && <StateList.Title>{STATE_LIST_TITLE}</StateList.Title>}
      <StateList.Content states={otherStates} />
    </StateList>
  )
}

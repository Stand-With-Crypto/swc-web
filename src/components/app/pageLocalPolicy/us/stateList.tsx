import { useMemo } from 'react'

import { StateList } from '@/components/app/pageLocalPolicy/common/stateList'
import { SearchResult } from '@/components/app/pageLocalPolicy/common/types'
import { states } from '@/components/app/pageLocalPolicy/us/config'
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
    const statesList = Object.entries(states).map(([code, name]) => ({
      code,
      name,
      url: urls.localPolicy(code),
    }))

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

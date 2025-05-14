import { useMemo } from 'react'

import { StateList } from '@/components/app/pageLocalPolicy/common/stateList'
import {
  IntlUrls,
  LocalPolicyStates,
  SearchResult,
} from '@/components/app/pageLocalPolicy/common/types'

const STATE_LIST_TITLE = 'Explore other states'

interface UsStateListProps {
  searchResult: SearchResult
  states: LocalPolicyStates
  urls: IntlUrls
}

export function UsStateList({ searchResult, states, urls }: UsStateListProps) {
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
  }, [searchResult, states, urls])

  return (
    <StateList>
      {searchResult && <StateList.Title>{STATE_LIST_TITLE}</StateList.Title>}
      <StateList.Content states={otherStates} />
    </StateList>
  )
}

'use client'
import { useState } from 'react'

import { localPolicyStatesMap } from '@/components/app/pageLocalPolicy/config'
import { SearchErrorMessage } from '@/components/app/pageLocalPolicy/searchErrorMessage'
import { SearchResultState } from '@/components/app/pageLocalPolicy/searchResultState'
import { StateList } from '@/components/app/pageLocalPolicy/stateList'
import { StateSearch } from '@/components/app/pageLocalPolicy/stateSearch'
import {
  PageLocalPolicyProps,
  SearchError,
  SearchResult,
} from '@/components/app/pageLocalPolicy/types'
import { getIntlUrls } from '@/utils/shared/urls'

export function PageLocalPolicy({ countryCode }: PageLocalPolicyProps) {
  const [searchError, setSearchError] = useState<SearchError>(null)
  const [searchResult, setSearchResult] = useState<SearchResult>(null)

  const states = localPolicyStatesMap[countryCode]

  const urls = getIntlUrls(countryCode)

  if (!states) {
    return <SearchErrorMessage error="COUNTRY_NOT_SUPPORTED" />
  }

  return (
    <section className="standard-spacing-from-navbar container mb-16 space-y-20">
      <StateSearch
        countryCode={countryCode}
        setSearchError={setSearchError}
        setSearchResult={setSearchResult}
      />

      {searchError && <SearchErrorMessage error={searchError} />}

      {searchResult && (
        <SearchResultState
          countryCode={countryCode}
          result={searchResult}
          states={states}
          urls={urls}
        />
      )}

      <StateList searchResult={searchResult} states={states} urls={urls} />
    </section>
  )
}

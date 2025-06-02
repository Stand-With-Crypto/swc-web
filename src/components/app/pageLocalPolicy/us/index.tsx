'use client'
import { useState } from 'react'

import { Layout } from '@/components/app/pageLocalPolicy/common/layout'
import { StateSearch } from '@/components/app/pageLocalPolicy/common/stateSearch'
import { SearchErrorCode, SearchResult } from '@/components/app/pageLocalPolicy/common/types'
import { UsHeader } from '@/components/app/pageLocalPolicy/us/header'
import { UsSearchError } from '@/components/app/pageLocalPolicy/us/searchError'
import { UsSearchResult } from '@/components/app/pageLocalPolicy/us/searchResult'
import { UsStateList } from '@/components/app/pageLocalPolicy/us/stateList'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

export function UsLocalPolicy() {
  const [searchErrorCode, setSearchErrorCode] = useState<SearchErrorCode>(null)
  const [searchResult, setSearchResult] = useState<SearchResult>(null)

  return (
    <Layout>
      <UsHeader />

      <StateSearch
        countryCode={countryCode}
        setSearchErrorCode={setSearchErrorCode}
        setSearchResult={setSearchResult}
      />

      <UsSearchError code={searchErrorCode} />

      <UsSearchResult searchResult={searchResult} />

      <UsStateList searchResult={searchResult} />
    </Layout>
  )
}

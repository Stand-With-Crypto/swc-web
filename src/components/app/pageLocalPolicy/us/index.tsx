'use client'
import { useState } from 'react'

import { Layout } from '@/components/app/pageLocalPolicy/common/layout'
import { StateSearch } from '@/components/app/pageLocalPolicy/common/stateSearch'
import { SearchErrorCode, SearchResult } from '@/components/app/pageLocalPolicy/common/types'
import { UsHeader } from '@/components/app/pageLocalPolicy/us/header'
import { UsSearchError } from '@/components/app/pageLocalPolicy/us/searchError'
import { UsSearchResult } from '@/components/app/pageLocalPolicy/us/searchResult'
import { UsStateList } from '@/components/app/pageLocalPolicy/us/stateList'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const countryCode = SupportedCountryCodes.US

const states = US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP

const urls = getIntlUrls(countryCode)

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

      <UsSearchResult countryCode={countryCode} searchResult={searchResult} urls={urls} />

      <UsStateList searchResult={searchResult} states={states} urls={urls} />
    </Layout>
  )
}

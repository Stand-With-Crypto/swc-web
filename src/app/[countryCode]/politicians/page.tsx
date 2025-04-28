import { Metadata } from 'next'

import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/common/utils'
import {
  PAGE_POLITICIANS_DESCRIPTION,
  PAGE_POLITICIANS_TITLE,
  UsPagePoliticians,
} from '@/components/app/pagePoliticians/us'
import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export const revalidate = 600 // 10 minutes
export const dynamic = 'force-static'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title: PAGE_POLITICIANS_TITLE,
    description: PAGE_POLITICIANS_DESCRIPTION,
  }),
}

export default async function PoliticiansHomepage() {
  const results = await queryDTSIAllPeople({ countryCode })

  const politicians = sortDTSIPersonDataTable(results.people).slice(0, 100)
  return <UsPagePoliticians {...{ politicians, countryCode }} />
}

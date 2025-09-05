import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/common/utils'
import { UsLocalPolicyStatePage } from '@/components/app/pageLocalPolicy/us/statePage'
import { getAdvocatesCountByState } from '@/data/aggregations/getAdvocatesCountByState'
import { getAllBills } from '@/data/bills/getAllBills'
import { queryDTSIHomepagePeople } from '@/data/dtsi/queries/queryDTSIHomepagePeople'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import {
  US_MAIN_STATE_CODE_WITH_DC_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

export const title = 'Local policy'
const description =
  'View bills, local elections, and find out where politicians in your state stand on crypto'

export const dynamic = 'error'
export const dynamicParams = false

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export function generateStaticParams() {
  return Object.keys(US_MAIN_STATE_CODE_WITH_DC_TO_DISPLAY_NAME_MAP).map(stateCode => ({
    countryCode: DEFAULT_SUPPORTED_COUNTRY_CODE,
    stateCode: stateCode.toLowerCase() as USStateCode,
  }))
}

export default async function LocalPolicyStatePageRoot({
  params,
}: {
  params: Promise<{ countryCode: SupportedCountryCodes; stateCode: USStateCode }>
}) {
  const { countryCode, stateCode } = await params

  if (
    countryCode !== DEFAULT_SUPPORTED_COUNTRY_CODE ||
    !(stateCode.toUpperCase() in US_MAIN_STATE_CODE_WITH_DC_TO_DISPLAY_NAME_MAP)
  ) {
    notFound()
  }

  const [dtsiPeopleData, initialTotalAdvocates, billsData] = await Promise.all([
    queryDTSIHomepagePeople({ countryCode, stateCode }),
    getAdvocatesCountByState(stateCode),
    getAllBills(countryCode, stateCode),
  ])

  const highestScores = sortDTSIPersonDataTable(dtsiPeopleData.highestScores)
  const lowestScores = sortDTSIPersonDataTable(dtsiPeopleData.lowestScores)

  return (
    <UsLocalPolicyStatePage
      billsData={billsData}
      initialTotalAdvocates={initialTotalAdvocates}
      politiciansData={{
        highestScores,
        lowestScores,
      }}
      stateCode={stateCode}
    />
  )
}

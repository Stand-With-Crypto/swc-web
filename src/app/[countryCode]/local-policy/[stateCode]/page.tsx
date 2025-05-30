import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/common/utils'
import { UsLocalPolicyStatePage } from '@/components/app/pageLocalPolicy/us/statePage'
import { getAdvocatesCountByState } from '@/data/aggregations/getAdvocatesCountByState'
import { queryDTSIHomepagePeople } from '@/data/dtsi/queries/queryDTSIHomepagePeople'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import {
  US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP,
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
  return Object.keys(US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP).map(stateCode => ({
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
    !(stateCode.toUpperCase() in US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP)
  ) {
    notFound()
  }

  const data = await queryDTSIHomepagePeople({ countryCode, stateCode })

  const highestScores = sortDTSIPersonDataTable(data.highestScores)
  const lowestScores = sortDTSIPersonDataTable(data.lowestScores)

  const initialTotalAdvocates = await getAdvocatesCountByState(stateCode)

  return (
    <UsLocalPolicyStatePage
      initialTotalAdvocates={initialTotalAdvocates}
      politiciansData={{
        highestScores,
        lowestScores,
      }}
      stateCode={stateCode}
    />
  )
}

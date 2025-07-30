import { Metadata } from 'next'

import { PageBills } from '@/components/app/pageBills'
import { getAllBills } from '@/data/bills/getAllBills'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import {
  US_MAIN_STATE_CODE_WITH_DC_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'
import { getStateNameResolver } from '@/utils/shared/stateUtils'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE
const stateNameResolver = getStateNameResolver(countryCode)

const title = 'Crypto Bills'
const description =
  "As Congress votes on legislation that would affect crypto and other digital assets, we'll keep an eye out for you. Check this page for information about key bills moving through the House and the Senate as well as analysis on whether they're pro-crypto or anti-crypto."

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

export default async function BillsStateSpecificPage({
  params,
}: {
  params: Promise<{ countryCode: SupportedCountryCodes; stateCode: USStateCode }>
}) {
  const { stateCode } = await params

  const results = await getAllBills(DEFAULT_SUPPORTED_COUNTRY_CODE, stateCode)

  return (
    <PageBills
      bills={results}
      countryCode={countryCode}
      description={description}
      title={`${stateNameResolver(stateCode)} Bills`}
    />
  )
}

import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { UsLocalPolicyStatePage } from '@/components/app/pageLocalPolicy/us/statePage'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/usStateUtils'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

export const title = 'Local policy'
const description =
  'View bills, local elections, and find out where politicians in your state stand on crypto'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default async function LocalPolicyStatePageRoot({
  params,
}: {
  params: Promise<{ countryCode: SupportedCountryCodes; stateCode: string }>
}) {
  const { countryCode, stateCode } = await params

  if (
    countryCode !== DEFAULT_SUPPORTED_COUNTRY_CODE ||
    !(stateCode.toUpperCase() in US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP)
  ) {
    notFound()
  }

  return <UsLocalPolicyStatePage stateCode={stateCode} />
}

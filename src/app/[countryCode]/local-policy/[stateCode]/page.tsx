import { Metadata } from 'next'

import { LocalPolicyStatePage } from '@/components/app/pageLocalPolicy/components'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export const title = 'Local policy'
const description =
  'View bills, local elections, and find out where politicians in your state stand on crypto'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

export default async function LocalPolicyStatePageRoot({
  params,
}: {
  params: Promise<{ stateCode: string }>
}) {
  const { stateCode } = await params

  return <LocalPolicyStatePage countryCode={countryCode} stateCode={stateCode} />
}

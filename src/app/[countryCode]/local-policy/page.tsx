import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { UsLocalPolicy } from '@/components/app/pageLocalPolicy/us'
import { PageProps } from '@/types'
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

export default async function LocalPolicyPageRoot(props: PageProps) {
  const params = await props.params
  const { countryCode } = params

  if (countryCode !== DEFAULT_SUPPORTED_COUNTRY_CODE) {
    notFound()
  }

  return <UsLocalPolicy />
}

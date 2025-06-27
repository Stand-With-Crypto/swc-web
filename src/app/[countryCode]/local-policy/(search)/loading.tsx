import { Metadata } from 'next'

import { UsLocalPolicySkeleton } from '@/components/app/pageLocalPolicy/us/skeleton'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'
export const dynamicParams = false

export const title = 'Local policy'
const description =
  'View bills, local elections, and find out where politicians in your state stand on crypto'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default async function LocalPolicyPageLoading() {
  return <UsLocalPolicySkeleton />
}

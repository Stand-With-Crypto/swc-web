import { Metadata } from 'next'

import { PageContribute } from '@/components/app/pageContribute'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title: 'Contribute',
  }),
}

export default async function ContributePage() {
  return <PageContribute />
}

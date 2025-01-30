import { Metadata } from 'next'

import { PageResources } from '@/components/app/pageResources'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title: 'Resources',
  }),
}

export default async function ResourcesPage() {
  return <PageResources />
}

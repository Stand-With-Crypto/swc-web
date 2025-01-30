import { Metadata } from 'next'

import { PageContribute } from '@/components/app/pageContribute'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title: 'Become a Stand With Crypto Partner',
    description: `We're calling on passionate developers, innovators, and enthusiasts to contribute to Stand With Crypto. Show people you care about crypto’s fate in America. Become an industry partner and get featured on our website.`,
  }),
}

export default async function ContributePage() {
  return <PageContribute />
}

import { Metadata } from 'next'

import { PageVoterGuide } from '@/components/app/pageVoterGuide'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'

const title = 'Voter Guide'
const description = 'Get information to help you vote during the upcoming elections'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default function VoterGuidePageRoot() {
  return <PageVoterGuide />
}

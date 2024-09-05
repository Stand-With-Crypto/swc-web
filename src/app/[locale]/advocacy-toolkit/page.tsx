import { Metadata } from 'next'

import { PageAdvocacyToolkit } from '@/components/app/pageAdvocacyToolkit'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'

const title = 'Advocacy made easy'
const description = 'Toolkit and tactics for Stand With Crypto advocates'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default async function AdvocacyToolkitPage() {
  return <PageAdvocacyToolkit description={description} title={title} />
}

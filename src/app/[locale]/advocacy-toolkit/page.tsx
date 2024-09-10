import { Metadata } from 'next'

import { PageAdvocacyToolkit } from '@/components/app/pageAdvocacyToolkit'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'

const title = 'Advocacy made easy'
const description =
  '52 million Americans own crypto and want their voices to be heard in the upcoming Elections. Help SWC drive change in your own community by using our advocacy toolkit'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default async function AdvocacyToolkitPage() {
  return <PageAdvocacyToolkit description={description} title={title} />
}

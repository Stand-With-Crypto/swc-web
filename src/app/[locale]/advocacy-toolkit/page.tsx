import { Metadata } from 'next'

import { PageAdvocacyToolkit } from '@/components/app/pageAdvocacyToolkit'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'

const title = 'Advocacy Made Easy'
const description =
  '52 million Americans own crypto and want their voices to be heard in the upcoming Elections. Help Stand With Crypto drive change in your own community by using our advocacy toolkit. These materials include helpful toolkits and tactics guides for a wide range of organizing activities, and training materials on organizing fundamentals. It includes the guides for hosting an advocacy event, digital advocacy tactics, and more.'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default async function AdvocacyToolkitPage() {
  return <PageAdvocacyToolkit description={description} title={title} />
}

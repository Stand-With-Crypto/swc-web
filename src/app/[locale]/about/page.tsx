import { PageAbout } from '@/components/app/pageAbout'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { Metadata } from 'next'

export const dynamic = 'error'

const title = 'Join the fight'
const description =
  'The goal of the Stand With Crypto Alliance is to mobilize the 52 million American crypto owners into a powerful force.'
export const metadata: Metadata = {
  ...generateMetadataDetails({
    description,
    title,
  }),
}

export default async function AboutPage() {
  return <PageAbout description={description} title={title} />
}

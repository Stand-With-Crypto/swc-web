import { Metadata } from 'next'

import { PagePartners } from '@/components/app/pagePartners'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'

const title = 'Our partners'
const description =
  'Stand With Crypto is first and foremost the result of 300,000+ people fighting to keep crypto in America. We’ve also partnered with a number of companies to fight alongside us.'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default async function PartnersPage({ params }: PageProps) {
  return <PagePartners description={description} locale={params.locale} title={title} />
}

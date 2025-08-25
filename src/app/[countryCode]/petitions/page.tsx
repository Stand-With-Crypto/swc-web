import { Metadata } from 'next'

import { PagePetitions } from '@/components/app/pagePetitions'
import { queryAllPetitions } from '@/data/petitions/queryAllPetitions'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

const title = 'Petitions'
const description = 'Sign these petitions to help shape the future of crypto regulation'

export const metadata: Metadata = {
  ...generateMetadataDetails({ title, description }),
}

export default async function PetitionsPage(props: PageProps) {
  const results = await queryAllPetitions()

  return (
    <PagePetitions
      countryCode={(await props.params).countryCode}
      description={description}
      petitions={results}
      title={title}
    />
  )
}

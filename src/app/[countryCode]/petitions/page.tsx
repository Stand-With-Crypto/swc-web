import { Metadata } from 'next'

import { PagePetitions } from '@/components/app/pagePetitions'
import { getAllPetitionsFromAPI } from '@/data/petitions/getAllPetitionsFromAPI'
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
  const { countryCode } = await props.params
  const results = await getAllPetitionsFromAPI(countryCode)

  return (
    <PagePetitions
      countryCode={countryCode}
      description={description}
      petitions={results}
      title={title}
    />
  )
}

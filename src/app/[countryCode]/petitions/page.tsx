import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PagePetitions } from '@/components/app/pagePetitions'
import { PagePetitionsWithDebugger } from '@/components/app/pagePetitions/pagePetitionsWithDebugger'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { getAllPetitions } from '@/utils/server/petitions/getAllPetitions'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

const title = 'Petitions'
const description = 'Sign these petitions to help shape the future of crypto regulation'

export const metadata: Metadata = {
  ...generateMetadataDetails({ title, description }),
}

const isStaging = NEXT_PUBLIC_ENVIRONMENT !== 'production'

export default async function PetitionsPage(props: PageProps) {
  const { countryCode } = await props.params
  const petitions = await getAllPetitions(countryCode)

  if (!petitions) {
    return notFound()
  }

  if (isStaging) {
    return (
      <PagePetitionsWithDebugger
        countryCode={countryCode}
        description={description}
        petitions={petitions}
        title={title}
      />
    )
  }

  return (
    <PagePetitions
      countryCode={countryCode}
      description={description}
      petitions={petitions}
      title={title}
    />
  )
}

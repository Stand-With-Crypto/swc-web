import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PagePetitionDetails } from '@/components/app/pagePetitionDetails'
import { queryAllPetitions } from '@/data/petitions/queryAllPetitions'
import {
  queryPetitionBySlug,
  queryPetitionRecentSignatures,
} from '@/data/petitions/queryPetitionBySlug'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

type Props = PageProps<{
  petitionSlug: string
}>

export async function generateStaticParams() {
  const allPetitions = await queryAllPetitions()

  const params = []

  // Generate params for each petition across all supported country codes
  for (const petition of allPetitions) {
    params.push({
      countryCode: SupportedCountryCodes.US,
      petitionSlug: petition.slug,
    })
  }

  return params
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const petition = await queryPetitionBySlug(params.petitionSlug)

  if (!petition) {
    return generateMetadataDetails({
      title: 'Petition Not Found',
      description: 'The requested petition could not be found.',
    })
  }

  return generateMetadataDetails({
    title: petition.title,
    description: petition.description,
  })
}

export default async function PetitionDetailsPage(props: Props) {
  const params = await props.params
  const petitionSlug = params.petitionSlug
  const countryCode = params.countryCode

  const [petition, recentSignatures] = await Promise.all([
    queryPetitionBySlug(petitionSlug),
    queryPetitionRecentSignatures(petitionSlug),
  ])

  if (!petition) {
    notFound()
  }

  return (
    <PagePetitionDetails
      countryCode={countryCode}
      isSigned={false}
      petition={petition}
      recentSignatures={recentSignatures}
    />
  )
}

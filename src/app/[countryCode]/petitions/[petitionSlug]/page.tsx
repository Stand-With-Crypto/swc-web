import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PagePetitionDetails } from '@/components/app/pagePetitionDetails'
import { getAllPetitionsFromAPI } from '@/data/petitions/getAllPetitionsFromAPI'
import { getPetitionBySlugFromAPI } from '@/data/petitions/getPetitionBySlugFromAPI'
import { queryPetitionRecentSignatures } from '@/data/petitions/queryPetitionRecentSignatures'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

type Props = PageProps<{
  petitionSlug: string
}>

export async function generateStaticParams() {
  const allPetitions = await getAllPetitionsFromAPI(SupportedCountryCodes.US)

  const params = []

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
  const petition = await getPetitionBySlugFromAPI(params.countryCode, params.petitionSlug)

  if (!petition) {
    return generateMetadataDetails({
      title: 'Petition Not Found',
      description: 'The requested petition could not be found.',
    })
  }

  return generateMetadataDetails({
    title: 'Sign this petition',
    description: petition.title,
  })
}

export default async function PetitionDetailsPage(props: Props) {
  const params = await props.params
  const petitionSlug = params.petitionSlug
  const countryCode = params.countryCode

  const [petition, recentSignatures] = await Promise.all([
    getPetitionBySlugFromAPI(countryCode, petitionSlug),
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

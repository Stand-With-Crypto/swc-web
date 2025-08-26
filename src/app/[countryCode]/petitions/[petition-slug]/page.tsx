import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PagePetitionDetails } from '@/components/app/pagePetitionDetails'
import {
  queryPetitionBySlug,
  queryPetitionRecentSignatures,
} from '@/data/petitions/queryPetitionBySlug'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

type Props = PageProps<{
  'petition-slug': string
}>

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const petition = await queryPetitionBySlug(params['petition-slug'])

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
  const petitionSlug = params['petition-slug']
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

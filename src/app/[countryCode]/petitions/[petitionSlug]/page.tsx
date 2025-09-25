import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { UsPagePetitionDetails } from '@/components/app/pagePetitionDetails/us'
import { queryPetitionRecentSignatures } from '@/data/petitions/queryPetitionRecentSignatures'
import { PageProps } from '@/types'
import { getAllPetitionsFromBuilderIO } from '@/utils/server/builder/models/data/petitions'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { getPetitionBySlug } from '@/utils/server/petitions/getPetitionBySlug'
import { getStateNameResolver } from '@/utils/shared/stateUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

type Props = PageProps<{
  petitionSlug: string
}>

export async function generateStaticParams() {
  const allPetitions = await getAllPetitionsFromBuilderIO({ countryCode })

  const params = []

  for (const petition of allPetitions) {
    params.push({
      countryCode,
      petitionSlug: petition.slug,
    })
  }

  return params
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const petition = await getPetitionBySlug({
    countryCode: params.countryCode,
    slug: params.petitionSlug,
  })

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

  const [petition, recentSignatures] = await Promise.all([
    getPetitionBySlug({ countryCode, slug: petitionSlug }),
    queryPetitionRecentSignatures({
      petitionSlug,
      countryCode,
      formatLocaleName: getStateNameResolver(countryCode),
    }),
  ])

  if (!petition) {
    notFound()
  }

  return (
    <UsPagePetitionDetails
      countryCode={countryCode}
      petition={petition}
      recentSignatures={recentSignatures}
    />
  )
}

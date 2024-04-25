import { Metadata } from 'next'

import { LocationUnitedStatesPresidential } from '@/components/app/pageLocationUnitedStatesPresidential'
import { queryDTSILocationUnitedStatesPresidential } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesPresidentialInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.HOUR

type LocationPresidentialRaceSpecificPageProps = PageProps

export async function generateMetadata(): Promise<Metadata> {
  const title = `See where U.S. Presidential Candidates stand on crypto`
  const description = `We asked U.S. Presidential Candidates for their thoughts on crypto. Here's what they said.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function LocationPresidentialSpecificPage({
  params,
}: LocationPresidentialRaceSpecificPageProps) {
  const { locale } = params

  const data = await queryDTSILocationUnitedStatesPresidential()

  if (!data) {
    throw new Error(
      `Invalid params for LocationPresidentialSpecificPage: ${JSON.stringify(params)}`,
    )
  }

  return <LocationUnitedStatesPresidential {...data} {...{ locale }} />
}

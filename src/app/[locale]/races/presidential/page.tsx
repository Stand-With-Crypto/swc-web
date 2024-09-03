import { Metadata } from 'next'

import { LocationRaceSpecific } from '@/components/app/pageLocationKeyRaces/locationRaceSpecific'
import { queryDTSILocationUnitedStatesPresidential } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesPresidentialInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION['10_MINUTES']

type LocationPresidentialRaceSpecificPageProps = PageProps

export async function generateMetadata(): Promise<Metadata> {
  const title = `US Presidential Race`
  const description = `See where politicians running for the US presidency stand on crypto.`
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

  return <LocationRaceSpecific {...data} {...{ locale }} />
}

import { Metadata } from 'next'

import { LocationRaceSpecific } from '@/components/app/pageLocationKeyRaces/us/locationRaceSpecific'
import { queryDTSILocationUnitedStatesPresidential } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesPresidentialInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

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
  const { countryCode } = await params

  const data = await queryDTSILocationUnitedStatesPresidential()

  return <LocationRaceSpecific {...data} {...{ countryCode }} />
}

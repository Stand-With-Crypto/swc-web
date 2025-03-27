import { Metadata } from 'next'

import { AUKeyRaces } from '@/components/app/pageLocationKeyRaces/au/locationAustralia/keyRaces'
import { AUKeyRacesStates } from '@/components/app/pageLocationKeyRaces/au/locationAustralia/keyRacesStates'
import { organizePeopleAU } from '@/components/app/pageLocationKeyRaces/au/locationAustralia/organizePeople'
import { LocationKeyRacesContainer } from '@/components/app/pageLocationKeyRaces/common'
import { queryDTSILocationAustraliaInformation } from '@/data/dtsi/queries/au/queryDTSILocationAustraliaInformation'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { prismaClient } from '@/utils/server/prismaClient'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = SupportedCountryCodes.AU

export async function generateMetadata(): Promise<Metadata> {
  const title = `Key Races in Australia`
  const description = `View the races critical to keeping crypto in Australia.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function LocationAustraliaPage() {
  const [dtsiResults, countAdvocates] = await Promise.all([
    queryDTSILocationAustraliaInformation(),
    prismaClient.user.count({ where: { countryCode } }),
  ])

  const groups = organizePeopleAU(dtsiResults)

  return (
    <LocationKeyRacesContainer
      countAdvocates={countAdvocates}
      countryCode={countryCode}
      keyRaces={<AUKeyRaces countryCode={countryCode} groups={groups} />}
      keyRacesStates={<AUKeyRacesStates countryCode={countryCode} />}
    />
  )
}

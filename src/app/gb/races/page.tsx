import { Metadata } from 'next'

import { LocationKeyRacesContainer } from '@/components/app/pageLocationKeyRaces/common'
import { GBKeyRaces } from '@/components/app/pageLocationKeyRaces/gb/locationUnitedKingdom/keyRaces'
import { GBKeyRacesStates } from '@/components/app/pageLocationKeyRaces/gb/locationUnitedKingdom/keyRacesStates'
import { organizePeopleGB } from '@/components/app/pageLocationKeyRaces/gb/locationUnitedKingdom/organizePeople'
import { queryDTSILocationUnitedKingdomInformation } from '@/data/dtsi/queries/gb/queryDTSILocationUnitedKingdomInformation'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { prismaClient } from '@/utils/server/prismaClient'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = SupportedCountryCodes.GB

export async function generateMetadata(): Promise<Metadata> {
  const title = `Key Races in the United Kingdom`
  const description = `View the races critical to keeping crypto in the United Kingdom.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function LocationUnitedKingdomPage() {
  const [dtsiResults, countAdvocates] = await Promise.all([
    queryDTSILocationUnitedKingdomInformation(),
    prismaClient.user.count({ where: { countryCode } }),
  ])

  const groups = organizePeopleGB(dtsiResults)

  return (
    <LocationKeyRacesContainer
      countAdvocates={countAdvocates}
      countryCode={countryCode}
      keyRaces={<GBKeyRaces countryCode={countryCode} groups={groups} />}
      keyRacesStates={<GBKeyRacesStates countryCode={countryCode} />}
    />
  )
}

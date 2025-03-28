import { Metadata } from 'next'

import { LocationUnitedStates } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates'
import { organizePeople } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates/organizePeople'
import { queryDTSILocationUnitedStatesInformation } from '@/data/dtsi/queries/us/queryDTSILocationUnitedStatesInformation'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { prismaClient } from '@/utils/server/prismaClient'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

export async function generateMetadata(): Promise<Metadata> {
  const title = `Key Races in the United States`
  const description = `View the races critical to keeping crypto in America.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function LocationUnitedStatesPage() {
  const [dtsiResults, countAdvocates] = await Promise.all([
    queryDTSILocationUnitedStatesInformation(),
    prismaClient.user.count(),
  ])

  const groups = organizePeople(dtsiResults)

  return (
    <LocationUnitedStates
      countAdvocates={countAdvocates}
      countryCode={countryCode}
      groups={groups}
    />
  )
}

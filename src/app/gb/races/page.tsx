import { Metadata } from 'next'

import { LocationUnitedKingdom } from '@/components/app/pageLocationKeyRaces/gb/locationUnitedKingdom'
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
    <LocationUnitedKingdom
      countAdvocates={countAdvocates}
      countryCode={countryCode}
      groups={groups}
    />
  )
}

import { Metadata } from 'next'

import { CAKeyRaces } from '@/components/app/pageLocationKeyRaces/ca/locationCanada/keyRaces'
import { CAKeyRacesStates } from '@/components/app/pageLocationKeyRaces/ca/locationCanada/keyRacesStates'
import { organizePeopleCA } from '@/components/app/pageLocationKeyRaces/ca/locationCanada/organizePeople'
import { LocationKeyRacesContainer } from '@/components/app/pageLocationKeyRaces/common'
import { queryDTSILocationCanadaInformation } from '@/data/dtsi/queries/ca/queryDTSILocationCanadaInformation'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { prismaClient } from '@/utils/server/prismaClient'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = SupportedCountryCodes.CA

export async function generateMetadata(): Promise<Metadata> {
  const title = `Key Races in Canada`
  const description = `View the races critical to keeping crypto in Canada.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function LocationCanadaPage() {
  const [dtsiResults, countAdvocates] = await Promise.all([
    queryDTSILocationCanadaInformation(),
    prismaClient.user.count({ where: { countryCode } }),
  ])

  const groups = organizePeopleCA(dtsiResults)

  return (
    <LocationKeyRacesContainer
      countAdvocates={countAdvocates}
      countryCode={countryCode}
      keyRaces={<CAKeyRaces countryCode={countryCode} groups={groups} />}
      keyRacesStates={<CAKeyRacesStates countryCode={countryCode} />}
    />
  )
}

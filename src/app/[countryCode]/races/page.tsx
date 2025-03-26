import { Metadata } from 'next'

import { LocationKeyRacesContainer } from '@/components/app/pageLocationKeyRaces/common'
import { USKeyRaces } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates/keyRaces'
import { KeyRacesStates } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates/keyRacesStates'
import { organizePeople } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates/organizePeople'
import { UserAddressVoterGuideInputSection } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates/userAddressVoterGuideInput'
import { queryDTSILocationUnitedStatesInformation } from '@/data/dtsi/queries/us/queryDTSILocationUnitedStatesInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { prismaClient } from '@/utils/server/prismaClient'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

type LocationUnitedStatesPageProps = PageProps

export async function generateMetadata(): Promise<Metadata> {
  const title = `Key Races in the United States`
  const description = `View the races critical to keeping crypto in America.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function LocationUnitedStatesPage({ params }: LocationUnitedStatesPageProps) {
  const { countryCode } = await params
  const [dtsiResults, countAdvocates] = await Promise.all([
    queryDTSILocationUnitedStatesInformation(),
    prismaClient.user.count(),
  ])

  const groups = organizePeople(dtsiResults)

  return (
    <LocationKeyRacesContainer
      countAdvocates={countAdvocates}
      countryCode={countryCode}
      keyRaces={<USKeyRaces countryCode={countryCode} groups={groups} />}
      keyRacesStates={<KeyRacesStates countryCode={countryCode} isGovernorRace />}
      shouldShowPACFooter
      shouldShowVoterRegistrationButton
      voterGuideInput={<UserAddressVoterGuideInputSection countryCode={countryCode} />}
    />
  )
}

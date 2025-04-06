import { Metadata } from 'next'

import { DarkHeroSection } from '@/components/app/pageLocationKeyRaces/common/darkHeroSection'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common/locationRaces'
import { USKeyRaces } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates/keyRaces'
import { USKeyRacesStates } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates/keyRacesStates'
import { organizePeople } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates/organizePeople'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { queryDTSILocationUnitedStatesInformation } from '@/data/dtsi/queries/us/queryDTSILocationUnitedStatesInformation'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  COUNTRY_CODE_TO_DEMONYM,
  COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX,
} from '@/utils/shared/intl/displayNames'
import {
  COUNTRY_CODE_TO_LOCALE,
  DEFAULT_SUPPORTED_COUNTRY_CODE,
} from '@/utils/shared/supportedCountries'

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
    <LocationRaces>
      <DarkHeroSection>
        <DarkHeroSection.Title>
          Key Races in {COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX[countryCode]}
        </DarkHeroSection.Title>
        <DarkHeroSection.Subtitle>
          View the key races occurring across{' '}
          {COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX[countryCode]}
          that will impact the future of crypto. Learn where politicians stand on crypto to make an
          informed decision at the ballot box.
        </DarkHeroSection.Subtitle>
        <DarkHeroSection.HighlightedText>
          <FormattedNumber amount={countAdvocates} locale={COUNTRY_CODE_TO_LOCALE[countryCode]} />{' '}
          advocates in {COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX[countryCode]}
        </DarkHeroSection.HighlightedText>
      </DarkHeroSection>

      <LocationRaces.KeyRaces>
        <USKeyRaces groups={groups} />
      </LocationRaces.KeyRaces>

      <LocationRaces.KeyRacesStates
        title={`${COUNTRY_CODE_TO_DEMONYM[countryCode]} States and Territories`}
      >
        <USKeyRacesStates />
      </LocationRaces.KeyRacesStates>
    </LocationRaces>
  )
}

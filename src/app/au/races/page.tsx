import { Metadata } from 'next'

import { AUKeyRacesStates } from '@/components/app/pageLocationKeyRaces/au/locationAustralia/keyRacesStates'
import { DarkHeroSection } from '@/components/app/pageLocationKeyRaces/common/darkHeroSection'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common/locationRaces'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  COUNTRY_CODE_TO_DEMONYM,
  COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX,
} from '@/utils/shared/intl/displayNames'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = SupportedCountryCodes.AU

export async function generateMetadata(): Promise<Metadata> {
  const title = `Key Races in ${COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX[countryCode]}`
  const description = `View the races critical to keeping crypto in ${COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX[countryCode]}.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function LocationAustraliaPage() {
  const countAdvocates = await prismaClient.user.count({ where: { countryCode } })

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
        {countAdvocates > 1000 && (
          <DarkHeroSection.HighlightedText>
            <FormattedNumber amount={countAdvocates} locale={COUNTRY_CODE_TO_LOCALE[countryCode]} />{' '}
            advocates in {COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX[countryCode]}
          </DarkHeroSection.HighlightedText>
        )}
      </DarkHeroSection>

      <LocationRaces.KeyRacesStates
        title={`${COUNTRY_CODE_TO_DEMONYM[countryCode]} States and Territories`}
      >
        <AUKeyRacesStates />
      </LocationRaces.KeyRacesStates>
    </LocationRaces>
  )
}

import { Metadata } from 'next'

import { CAKeyRacesStates } from '@/components/app/pageLocationKeyRaces/ca/locationCanada/keyRacesStates'
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

const countryCode = SupportedCountryCodes.CA
const countryDisplayNameWithPrefix = COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX[countryCode]

export async function generateMetadata(): Promise<Metadata> {
  const title = `Key Races in ${countryDisplayNameWithPrefix}`
  const description = `View the races critical to keeping crypto in ${countryDisplayNameWithPrefix}.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function LocationCanadaPage() {
  const countAdvocates = await prismaClient.user.count({ where: { countryCode } })

  return (
    <LocationRaces>
      <DarkHeroSection>
        <DarkHeroSection.Title>Key Races in {countryDisplayNameWithPrefix}</DarkHeroSection.Title>
        <DarkHeroSection.Subtitle>
          View the key races occurring across {countryDisplayNameWithPrefix} that will impact the
          future of crypto. Learn where politicians stand on crypto to make an informed decision at
          the ballot box.
        </DarkHeroSection.Subtitle>
        <DarkHeroSection.HighlightedText>
          <FormattedNumber amount={countAdvocates} locale={COUNTRY_CODE_TO_LOCALE[countryCode]} />{' '}
          advocates in {countryDisplayNameWithPrefix}
        </DarkHeroSection.HighlightedText>
      </DarkHeroSection>

      <LocationRaces.KeyRacesStates
        subtitle="Dive deeper and discover races in other provinces and territories"
        title={`${COUNTRY_CODE_TO_DEMONYM[countryCode]} Provinces and Territories`}
      >
        <CAKeyRacesStates />
      </LocationRaces.KeyRacesStates>
    </LocationRaces>
  )
}

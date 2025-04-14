import { Metadata } from 'next'

import { DarkHeroSection } from '@/components/app/pageLocationKeyRaces/common/darkHeroSection'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common/locationRaces'
import { GBKeyRacesStates } from '@/components/app/pageLocationKeyRaces/gb/locationGreatBritain/keyRacesStates'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  COUNTRY_CODE_TO_DEMONYM,
  COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX,
} from '@/utils/shared/intl/displayNames'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { GBUserActionViewKeyRacesCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = SupportedCountryCodes.GB
const countryDisplayNameWithPrefix = COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX[countryCode]

export async function generateMetadata(): Promise<Metadata> {
  const title = `Key Races in ${countryDisplayNameWithPrefix}`
  const description = `View the races critical to keeping crypto in ${countryDisplayNameWithPrefix}.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function LocationGreatBritainPage() {
  const countAdvocates = await prismaClient.user.count({ where: { countryCode } })

  return (
    <LocationRaces>
      <LocationRaces.ActionRegisterer
        input={{
          campaignName: GBUserActionViewKeyRacesCampaignName.H1_2025,
          countryCode,
        }}
      />

      <DarkHeroSection>
        <DarkHeroSection.Title>Key Races in {countryDisplayNameWithPrefix}</DarkHeroSection.Title>
        <DarkHeroSection.Subtitle>
          View the key races occurring across {countryDisplayNameWithPrefix} that will impact the
          future of crypto. Learn where politicians stand on crypto to make an informed decision at
          the ballot box.
        </DarkHeroSection.Subtitle>
        {countAdvocates > 1000 && (
          <DarkHeroSection.HighlightedText>
            <FormattedNumber amount={countAdvocates} locale={COUNTRY_CODE_TO_LOCALE[countryCode]} />{' '}
            advocates in {countryDisplayNameWithPrefix}
          </DarkHeroSection.HighlightedText>
        )}
      </DarkHeroSection>

      <LocationRaces.KeyRacesStates
        subtitle="Dive deeper and discover races in each country and region"
        title={`${COUNTRY_CODE_TO_DEMONYM[countryCode]} Countries and Regions`}
      >
        <GBKeyRacesStates />
      </LocationRaces.KeyRacesStates>
    </LocationRaces>
  )
}

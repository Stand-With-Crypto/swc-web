import { Metadata } from 'next'

import { DarkHeroSection } from '@/components/app/pageLocationKeyRaces/common/darkHeroSection'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common/locationRaces'
import { NestedPageLink } from '@/components/app/pageLocationKeyRaces/common/nestedPageLink'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { queryDTSIStatePrimaryDistricts } from '@/data/dtsi/queries/queryDTSIStatePrimaryDistricts'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { prismaClient } from '@/utils/server/prismaClient'
import { COUNTRY_CODE_TO_DISPLAY_NAME } from '@/utils/shared/intl/displayNames'
import {
  AU_STATE_CODE_TO_DISPLAY_NAME_MAP,
  getAUStateNameFromStateCode,
} from '@/utils/shared/stateMappings/auStateUtils'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { toBool } from '@/utils/shared/toBool'
import { getIntlUrls } from '@/utils/shared/urls'
import { zodState } from '@/validation/fields/zodState'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = SupportedCountryCodes.AU
const urls = getIntlUrls(countryCode)

type LocationStateSpecificPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({
  params,
}: LocationStateSpecificPageProps): Promise<Metadata> {
  const { stateCode } = await params
  const validatedStateCode = zodState.parse(stateCode.toUpperCase(), countryCode)

  const stateName = getAUStateNameFromStateCode(validatedStateCode)

  const title = `Key Races in ${stateName}`
  const description = `View the races critical to keeping crypto in ${stateName}.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export async function generateStaticParams() {
  return Object.keys(AU_STATE_CODE_TO_DISPLAY_NAME_MAP)
    .sort()
    .slice(0, toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION) ? 1 : 99999)
    .map(stateCode => ({
      stateCode: stateCode.toLowerCase(),
    }))
}

export default async function LocationStateSpecificPage({
  params,
}: LocationStateSpecificPageProps) {
  const { stateCode: rawStateCode } = await params
  const stateCode = zodState.parse(rawStateCode.toUpperCase(), countryCode)
  const stateDisplayName = getAUStateNameFromStateCode(stateCode)

  const [dtsiResults, countAdvocates] = await Promise.all([
    queryDTSIStatePrimaryDistricts({ stateCode, countryCode }),
    prismaClient.user.count({
      where: { address: { countryCode, administrativeAreaLevel1: stateCode } },
    }),
  ])

  if (!dtsiResults) {
    throw new Error(`Invalid params for LocationStateSpecificPage: ${JSON.stringify(params)}`)
  }

  return (
    <LocationRaces>
      <DarkHeroSection>
        <DarkHeroSection.Breadcrumbs
          sections={[
            {
              name: COUNTRY_CODE_TO_DISPLAY_NAME[countryCode],
              url: urls.locationKeyRaces(),
            },
            {
              name: stateDisplayName,
            },
          ]}
        />

        <DarkHeroSection.Title>Key Races in {stateDisplayName}</DarkHeroSection.Title>
        {countAdvocates > 1000 && (
          <DarkHeroSection.HighlightedText>
            <FormattedNumber amount={countAdvocates} locale={COUNTRY_CODE_TO_LOCALE[countryCode]} />{' '}
            crypto advocates
          </DarkHeroSection.HighlightedText>
        )}
      </DarkHeroSection>

      <LocationRaces.KeyRacesStates
        subtitle="Dive deeper and discover who’s running for office in each constituency"
        title={`${stateDisplayName} Constituencies`}
        useFlexBox={dtsiResults.primaryDistricts.length < 4}
      >
        {dtsiResults.primaryDistricts.map(district => (
          <NestedPageLink
            href={urls.locationDistrictSpecificHouseOfReps({
              stateCode,
              district: district.toLowerCase(),
            })}
            key={district}
          >
            {district}
          </NestedPageLink>
        ))}
      </LocationRaces.KeyRacesStates>
    </LocationRaces>
  )
}

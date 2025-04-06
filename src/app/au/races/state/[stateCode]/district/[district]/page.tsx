import { isEmpty } from 'lodash-es'
import { Metadata } from 'next'

import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { organizeAUDistrictSpecificPeople } from '@/components/app/pageLocationKeyRaces/au/district/organizeDistrictSpecificPeople'
import { DarkHeroSection } from '@/components/app/pageLocationKeyRaces/common/darkHeroSection'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common/locationRaces'
import { queryDTSIRacesPeopleByRolePrimaryDistrict } from '@/data/dtsi/queries/queryDTSIRacesPeopleByRolePrimaryDistrict'
import { queryDTSIStatePrimaryDistricts } from '@/data/dtsi/queries/queryDTSIStatePrimaryDistricts'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { COUNTRY_CODE_TO_DISPLAY_NAME } from '@/utils/shared/intl/displayNames'
import {
  AU_STATE_CODE_TO_DISPLAY_NAME_MAP,
  AUStateCode,
  getAUStateNameFromStateCode,
} from '@/utils/shared/stateMappings/auStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { toBool } from '@/utils/shared/toBool'
import { getIntlUrls } from '@/utils/shared/urls'
import { zodState } from '@/validation/fields/zodState'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = SupportedCountryCodes.AU
const urls = getIntlUrls(countryCode)

type AULocationDistrictSpecificPageProps = PageProps<{
  stateCode: string
  district: string
}>

export async function generateMetadata({
  params,
}: AULocationDistrictSpecificPageProps): Promise<Metadata> {
  const { district } = await params
  const decodedDistrict = decodeURIComponent(district)

  const title = `Key Races in ${decodedDistrict}`
  const description = `View the races critical to keeping crypto in ${decodedDistrict}.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export async function generateStaticParams() {
  const pageParams = []

  const statesToGenerate = toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)
    ? Object.keys(AU_STATE_CODE_TO_DISPLAY_NAME_MAP)[0]
    : Object.keys(AU_STATE_CODE_TO_DISPLAY_NAME_MAP)

  // This might be a bit slow, if it becomes a problem we can batch the states
  for (const stateCode of statesToGenerate) {
    const result = await queryDTSIStatePrimaryDistricts({
      stateCode: stateCode as AUStateCode,
      countryCode,
    })
    const districts = result?.primaryDistricts ?? []

    for (const district of districts) {
      pageParams.push({
        stateCode: stateCode.toLowerCase(),
        district: encodeURIComponent(district),
      })
    }
  }

  return pageParams
}

export default async function AULocationDistrictSpecificPage({
  params,
}: AULocationDistrictSpecificPageProps) {
  const { stateCode: rawStateCode, district } = await params
  const decodedDistrict = decodeURIComponent(district)
  const stateCode = zodState.parse(rawStateCode.toUpperCase(), countryCode)

  if (!stateCode) {
    throw new Error(`Invalid state code for LocationDistrictSpecificPage: ${rawStateCode}`)
  }

  const data = await queryDTSIRacesPeopleByRolePrimaryDistrict({
    district: decodedDistrict,
    countryCode,
  })

  if (!data) {
    throw new Error(`Invalid params for LocationDistrictSpecificPage: ${JSON.stringify(params)}`)
  }

  const { houseOfReps } = organizeAUDistrictSpecificPeople(data.people)

  return (
    <LocationRaces>
      <LocationRaces.ActionRegisterer
        input={{
          countryCode,
          stateCode: stateCode,
          constituency: decodedDistrict,
        }}
      />
      <DarkHeroSection>
        <DarkHeroSection.Breadcrumbs
          sections={[
            {
              name: COUNTRY_CODE_TO_DISPLAY_NAME[countryCode],
              url: urls.locationKeyRaces(),
            },
            {
              name: getAUStateNameFromStateCode(stateCode),
              url: urls.locationStateSpecific(stateCode),
            },
            {
              name: decodedDistrict,
            },
          ]}
        />
        <DarkHeroSection.Title>Key Races in {decodedDistrict}</DarkHeroSection.Title>
      </DarkHeroSection>

      <LocationRaces.Content>
        {isEmpty(houseOfReps) ? (
          <LocationRaces.EmptyMessage>
            There's no key races currently in {decodedDistrict}
          </LocationRaces.EmptyMessage>
        ) : (
          <DTSIPersonHeroCardSection
            countryCode={countryCode}
            cta={
              <LocationRaces.ViewRaceCTA
                href={urls.locationStateSpecificHouseOfRepsRace(stateCode)}
              />
            }
            people={houseOfReps}
            title={`House of Representatives Race (${decodedDistrict})`}
          />
        )}
      </LocationRaces.Content>
    </LocationRaces>
  )
}

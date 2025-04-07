import { isEmpty } from 'lodash-es'
import { Metadata } from 'next'

import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { organizeCADistrictSpecificPeople } from '@/components/app/pageLocationKeyRaces/ca/district/organizeDistrictSpecificPeople'
import { DarkHeroSection } from '@/components/app/pageLocationKeyRaces/common/darkHeroSection'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common/locationRaces'
import { queryDTSIRacesPeopleByRolePrimaryDistrict } from '@/data/dtsi/queries/queryDTSIRacesPeopleByRolePrimaryDistrict'
import { queryDTSIStatePrimaryDistricts } from '@/data/dtsi/queries/queryDTSIStatePrimaryDistricts'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { COUNTRY_CODE_TO_DISPLAY_NAME } from '@/utils/shared/intl/displayNames'
import {
  CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
  CAProvinceOrTerritoryCode,
  getCAProvinceOrTerritoryNameFromCode,
} from '@/utils/shared/stateMappings/caProvinceUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { toBool } from '@/utils/shared/toBool'
import { getIntlUrls } from '@/utils/shared/urls'
import { zodState } from '@/validation/fields/zodState'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = SupportedCountryCodes.CA
const urls = getIntlUrls(countryCode)

type CALocationDistrictSpecificPageProps = PageProps<{
  stateCode: string
  district: string
}>

export async function generateMetadata({
  params,
}: CALocationDistrictSpecificPageProps): Promise<Metadata> {
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
    ? Object.keys(CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP)[0]
    : Object.keys(CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP)

  // This might be a bit slow, if it becomes a problem we can batch the states
  for (const stateCode of statesToGenerate) {
    const result = await queryDTSIStatePrimaryDistricts({
      stateCode: stateCode as CAProvinceOrTerritoryCode,
      countryCode,
    })
    const districts = result?.primaryDistricts ?? []

    for (const district of districts) {
      pageParams.push({
        stateCode: stateCode.toLowerCase(),
        district,
      })
    }
  }

  return pageParams
}

export default async function CALocationDistrictSpecificPage({
  params,
}: CALocationDistrictSpecificPageProps) {
  const pageParams = await params
  const stateCode = zodState.parse(pageParams.stateCode.toUpperCase(), countryCode)
  const district = decodeURIComponent(pageParams.district)

  if (!stateCode) {
    throw new Error(`Invalid state code for LocationDistrictSpecificPage: ${pageParams.stateCode}`)
  }

  const data = await queryDTSIRacesPeopleByRolePrimaryDistrict({
    district,
    countryCode,
  })

  if (!data) {
    throw new Error(`Invalid params for LocationDistrictSpecificPage: ${JSON.stringify(params)}`)
  }

  const { houseOfCommons } = organizeCADistrictSpecificPeople(data.people)

  return (
    <LocationRaces>
      <LocationRaces.ActionRegisterer
        input={{
          countryCode,
          stateCode: stateCode,
          constituency: district,
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
              name: getCAProvinceOrTerritoryNameFromCode(stateCode),
              url: urls.locationStateSpecific(stateCode),
            },
            {
              name: district,
            },
          ]}
        />
        <DarkHeroSection.Title>Key Races in {district}</DarkHeroSection.Title>
      </DarkHeroSection>

      <LocationRaces.Content>
        {isEmpty(houseOfCommons) ? (
          <LocationRaces.EmptyMessage>
            There's no key races currently in {district}
          </LocationRaces.EmptyMessage>
        ) : (
          <DTSIPersonHeroCardSection
            countryCode={countryCode}
            cta={
              <LocationRaces.ViewRaceCTA
                href={urls.locationStateSpecificHouseOfCommonsRace(stateCode)}
              />
            }
            people={houseOfCommons}
            title={`House of Commons Race (${district})`}
          />
        )}
      </LocationRaces.Content>
    </LocationRaces>
  )
}

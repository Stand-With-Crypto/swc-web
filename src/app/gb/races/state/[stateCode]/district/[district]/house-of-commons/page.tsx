import { compact, isEmpty } from 'lodash-es'
import { Metadata } from 'next'

import { DarkHeroSection } from '@/components/app/pageLocationKeyRaces/common/darkHeroSection'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common/locationRaces'
import { organizeGBRaceSpecificPeople } from '@/components/app/pageLocationKeyRaces/gb/locationRaceSpecific'
import { queryDTSIRacesPeopleByRolePrimaryDistrict } from '@/data/dtsi/queries/queryDTSIRacesPeopleByRolePrimaryDistrict'
import { queryDTSIStatePrimaryDistricts } from '@/data/dtsi/queries/queryDTSIStatePrimaryDistricts'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { findRecommendedCandidate } from '@/utils/shared/findRecommendedCandidate'
import {
  COUNTRY_CODE_TO_DEMONYM,
  COUNTRY_CODE_TO_DISPLAY_NAME,
} from '@/utils/shared/intl/displayNames'
import {
  GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP,
  GBCountryCode,
  getGBCountryNameFromCode,
} from '@/utils/shared/stateMappings/gbCountryUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { toBool } from '@/utils/shared/toBool'
import { getIntlUrls } from '@/utils/shared/urls'
import { GBUserActionViewKeyRacesCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import { zodState } from '@/validation/fields/zodState'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = SupportedCountryCodes.GB
const urls = getIntlUrls(countryCode)

type GBLocationDistrictPageProps = PageProps<{
  /**
   * Represents {@link _GBCountryCode} (e.g., 'ENG')
   */
  stateCode: string
  /**
   * Represents GB Constituency
   */
  district: string
}>

export async function generateMetadata({ params }: GBLocationDistrictPageProps): Promise<Metadata> {
  const { district } = await params
  const decodedDistrict = decodeURIComponent(district)

  const title = `Key Race in ${decodedDistrict}`
  const description = `View the candidates running in the ${decodedDistrict} constituency.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export async function generateStaticParams() {
  const pageParams = []

  const statesToGenerate = toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)
    ? [Object.keys(GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP)[0]]
    : Object.keys(GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP)

  for (const stateCode of statesToGenerate) {
    const result = await queryDTSIStatePrimaryDistricts({
      stateCode: stateCode as GBCountryCode,
      countryCode,
    })
    const districts = result?.primaryDistricts ?? []

    for (const district of districts) {
      pageParams.push({
        stateCode: stateCode.toLowerCase(),
        district: district.toLowerCase(),
      })
    }
  }

  return pageParams
}

export default async function LocationHouseOfCommonsSpecificPage({
  params,
}: GBLocationDistrictPageProps) {
  const pageParams = await params
  const stateCode = zodState.parse(pageParams.stateCode.toUpperCase(), countryCode)
  const stateDisplayName = getGBCountryNameFromCode(stateCode)

  const district = decodeURIComponent(pageParams.district)

  const data = await queryDTSIRacesPeopleByRolePrimaryDistrict({
    district,
    countryCode,
  })

  const districtDisplayNameResult = await queryDTSIStatePrimaryDistricts({
    stateCode,
    countryCode,
    district,
  })
  const districtDisplayName = districtDisplayNameResult?.primaryDistricts?.[0]

  if (!data || !districtDisplayName) {
    throw new Error(
      `Invalid params for LocationHouseOfCommonsSpecificPage: ${JSON.stringify(params)}`,
    )
  }

  const groups = organizeGBRaceSpecificPeople(data.people)
  const { recommended, others } = findRecommendedCandidate(groups)
  const racesData = compact([
    recommended && { person: recommended, isRecommended: true },
    ...others.map(person => ({ person, isRecommended: false })),
  ])

  return (
    <LocationRaces disableVerticalSpacing>
      <LocationRaces.ActionRegisterer
        input={{
          campaignName: GBUserActionViewKeyRacesCampaignName.H1_2025,
          countryCode,
          stateCode,
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
              name: stateDisplayName,
              url: urls.locationStateSpecific(stateCode),
            },
            {
              name: `House of Commons (${districtDisplayName})`,
            },
          ]}
        />
        <DarkHeroSection.Title>
          {COUNTRY_CODE_TO_DEMONYM[countryCode]} House of Commons ({districtDisplayName})
        </DarkHeroSection.Title>
      </DarkHeroSection>

      <LocationRaces.DetailedCandidateListContainer>
        {isEmpty(racesData) ? (
          <LocationRaces.EmptyMessage gutterTop>
            There are no key races currently listed for {districtDisplayName}
          </LocationRaces.EmptyMessage>
        ) : (
          racesData.map(race => (
            <LocationRaces.DetailedCandidateListItem
              countryCode={countryCode}
              isRecommended={race.isRecommended}
              key={race.person.id}
              person={race.person}
            />
          ))
        )}
      </LocationRaces.DetailedCandidateListContainer>
    </LocationRaces>
  )
}

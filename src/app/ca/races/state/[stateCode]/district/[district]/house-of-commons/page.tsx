import { compact, isEmpty } from 'lodash-es'
import { Metadata } from 'next'

import { organizeCARaceSpecificPeople } from '@/components/app/pageLocationKeyRaces/ca/locationRaceSpecific'
import { DarkHeroSection } from '@/components/app/pageLocationKeyRaces/common/darkHeroSection'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common/locationRaces'
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
  CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
  CAProvinceOrTerritoryCode,
  getCAProvinceOrTerritoryNameFromCode,
} from '@/utils/shared/stateMappings/caProvinceUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { toBool } from '@/utils/shared/toBool'
import { getIntlUrls } from '@/utils/shared/urls'
import { CAUserActionViewKeyRacesCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { zodState } from '@/validation/fields/zodState'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = SupportedCountryCodes.CA
const urls = getIntlUrls(countryCode)

type CALocationDistrictPageProps = PageProps<{
  stateCode: string
  district: string
}>

export async function generateMetadata({ params }: CALocationDistrictPageProps): Promise<Metadata> {
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
        district: district.toLowerCase(),
      })
    }
  }

  return pageParams
}

export default async function LocationHouseOfCommonsSpecificPage({
  params,
}: CALocationDistrictPageProps) {
  const pageParams = await params
  const stateCode = zodState.parse(pageParams.stateCode.toUpperCase(), countryCode)
  const stateDisplayName = getCAProvinceOrTerritoryNameFromCode(stateCode)

  const district = decodeURIComponent(pageParams.district)

  const data = await queryDTSIRacesPeopleByRolePrimaryDistrict({
    district,
    countryCode,
  })

  const districtDisplayName = await queryDTSIStatePrimaryDistricts({
    stateCode,
    countryCode,
    district,
  }).then(result => result?.primaryDistricts?.[0])

  if (!data || !districtDisplayName) {
    throw new Error(
      `Invalid params for LocationHouseOfCommonsSpecificPage: ${JSON.stringify(params)}`,
    )
  }

  const groups = organizeCARaceSpecificPeople(data.people)
  const { recommended, others } = findRecommendedCandidate(groups)
  const racesData = compact([
    recommended && { person: recommended, isRecommended: true },
    ...others.map(person => ({ person, isRecommended: false })),
  ])

  return (
    <LocationRaces disableVerticalSpacing>
      <LocationRaces.ActionRegisterer
        input={{
          campaignName: CAUserActionViewKeyRacesCampaignName['H1_2025'],
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
            There's no key races currently in {districtDisplayName}
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

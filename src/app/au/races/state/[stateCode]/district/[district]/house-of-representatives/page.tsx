import { compact, isEmpty } from 'lodash-es'
import { Metadata } from 'next'

import { organizeAURaceSpecificPeople } from '@/components/app/pageLocationKeyRaces/au/locationRaceSpecific/organizeRaceSpecificPeople'
import { DarkHeroSection } from '@/components/app/pageLocationKeyRaces/common/darkHeroSection'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common/locationRaces'
import { queryDTSIRacesPeopleByRolePrimaryDistrict } from '@/data/dtsi/queries/queryDTSIRacesPeopleByRolePrimaryDistrict'
import { queryDTSIStatePrimaryDistricts } from '@/data/dtsi/queries/queryDTSIStatePrimaryDistricts'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { findRecommendedCandidate } from '@/utils/shared/findRecommendedCandidate'
import { COUNTRY_CODE_TO_DISPLAY_NAME } from '@/utils/shared/intl/displayNames'
import {
  AU_STATE_CODE_TO_DISPLAY_NAME_MAP,
  AUStateCode,
  getAUStateNameFromStateCode,
} from '@/utils/shared/stateMappings/auStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { toBool } from '@/utils/shared/toBool'
import { getIntlUrls } from '@/utils/shared/urls'
import { AUUserActionViewKeyRacesCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { zodState } from '@/validation/fields/zodState'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = SupportedCountryCodes.AU
const urls = getIntlUrls(countryCode)

type AUDistrictHouseOfRepsRacePageProps = PageProps<{
  stateCode: string
  district: string
}>

export async function generateMetadata({
  params,
}: AUDistrictHouseOfRepsRacePageProps): Promise<Metadata> {
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
    ? [Object.keys(AU_STATE_CODE_TO_DISPLAY_NAME_MAP)[0]]
    : Object.keys(AU_STATE_CODE_TO_DISPLAY_NAME_MAP)

  for (const stateCode of statesToGenerate) {
    const result = await queryDTSIStatePrimaryDistricts({
      stateCode: stateCode as AUStateCode,
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

export default async function AUDistrictHouseOfRepsRacePage({
  params,
}: AUDistrictHouseOfRepsRacePageProps) {
  const pageParams = await params
  const stateCode = zodState.parse(pageParams.stateCode.toUpperCase(), countryCode)
  const district = decodeURIComponent(pageParams.district)
  const stateDisplayName = getAUStateNameFromStateCode(stateCode)

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
    throw new Error(`Invalid params for LocationHouseOfRepsSpecificPage: ${JSON.stringify(params)}`)
  }

  const groups = organizeAURaceSpecificPeople(data.people)
  const { recommended, others } = findRecommendedCandidate(groups)
  const racesData = compact([
    recommended && { person: recommended, isRecommended: true },
    ...others.map(person => ({ person, isRecommended: false })),
  ])

  return (
    <LocationRaces disableVerticalSpacing>
      <LocationRaces.ActionRegisterer
        input={{
          campaignName: AUUserActionViewKeyRacesCampaignName['H1_2025'],
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
              name: `House of Representatives (${districtDisplayName})`,
            },
          ]}
        />
        <DarkHeroSection.Title>
          House of Representatives ({districtDisplayName})
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
              shouldHideStanceScores={false}
            />
          ))
        )}
      </LocationRaces.DetailedCandidateListContainer>
    </LocationRaces>
  )
}

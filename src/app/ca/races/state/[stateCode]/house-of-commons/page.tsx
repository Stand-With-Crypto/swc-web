import { compact, isEmpty } from 'lodash-es'
import { Metadata } from 'next'

import { organizeCARaceSpecificPeople } from '@/components/app/pageLocationKeyRaces/ca/locationRaceSpecific'
import { DarkHeroSection } from '@/components/app/pageLocationKeyRaces/common/darkHeroSection'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common/locationRaces'
import { queryDTSILocationHouseSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationHouseSpecificInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { findRecommendedCandidate } from '@/utils/shared/findRecommendedCandidate'
import {
  COUNTRY_CODE_TO_DEMONYM,
  COUNTRY_CODE_TO_DISPLAY_NAME,
} from '@/utils/shared/intl/displayNames'
import {
  CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
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

type LocationHouseOfCommonsRaceSpecificPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({
  params,
}: LocationHouseOfCommonsRaceSpecificPageProps): Promise<Metadata> {
  const { stateCode } = await params
  const validatedStateCode = zodState.parse(stateCode.toUpperCase(), countryCode)
  const stateName = getCAProvinceOrTerritoryNameFromCode(validatedStateCode)
  const title = `${stateName} Canadian House of Commons Race`
  const description = `See where politicians running for the Canadian House of Commons in ${stateName} stand on crypto.`

  return generateMetadataDetails({
    title,
    description,
  })
}

export async function generateStaticParams() {
  return Object.keys(CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP)
    .slice(0, toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION) ? 1 : 99999)
    .map(stateCode => ({
      stateCode: stateCode.toLowerCase(),
    }))
}

export default async function LocationHouseOfCommonsSpecificPage({
  params,
}: LocationHouseOfCommonsRaceSpecificPageProps) {
  const { stateCode: rawStateCode } = await params
  const stateCode = zodState.parse(rawStateCode.toUpperCase(), countryCode)
  const stateDisplayName = getCAProvinceOrTerritoryNameFromCode(stateCode)

  const data = await queryDTSILocationHouseSpecificInformation({
    stateCode,
    countryCode,
  })

  if (!data) {
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
              name: 'Canadian House of Commons',
            },
          ]}
        />
        <DarkHeroSection.Title>
          {COUNTRY_CODE_TO_DEMONYM[countryCode]} House of Commons ({stateCode})
        </DarkHeroSection.Title>
      </DarkHeroSection>

      <LocationRaces.DetailedCandidateListContainer>
        {isEmpty(racesData) ? (
          <LocationRaces.EmptyMessage gutterTop>
            There's no key races currently in {stateDisplayName}
          </LocationRaces.EmptyMessage>
        ) : (
          racesData.map(race => (
            <LocationRaces.DetailedCandidateListItem
              countryCode={countryCode}
              isRecommended={race.isRecommended}
              key={race.person.id}
              person={race.person}
              useThumbsUpOrDownGrade
            />
          ))
        )}
      </LocationRaces.DetailedCandidateListContainer>
    </LocationRaces>
  )
}

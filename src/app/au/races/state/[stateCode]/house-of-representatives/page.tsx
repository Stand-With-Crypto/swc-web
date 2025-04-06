import { compact, isEmpty } from 'lodash-es'
import { Metadata } from 'next'

import { organizeAURaceSpecificPeople } from '@/components/app/pageLocationKeyRaces/au/locationRaceSpecific/organizeRaceSpecificPeople'
import { DarkHeroSection } from '@/components/app/pageLocationKeyRaces/common/darkHeroSection'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common/locationRaces'
import { queryDTSILocationHouseSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationHouseSpecificInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { findRecommendedCandidate } from '@/utils/shared/findRecommendedCandidate'
import { COUNTRY_CODE_TO_DISPLAY_NAME } from '@/utils/shared/intl/displayNames'
import {
  AU_STATE_CODE_TO_DISPLAY_NAME_MAP,
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

type LocationHouseOfRepsRaceSpecificPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({
  params,
}: LocationHouseOfRepsRaceSpecificPageProps): Promise<Metadata> {
  const { stateCode } = await params
  const validatedStateCode = zodState.parse(stateCode.toUpperCase(), countryCode)
  const stateName = getAUStateNameFromStateCode(validatedStateCode)
  const title = `${stateName} Australian House of Representatives Race`
  const description = `See where politicians running for the Australian House of Representatives in ${stateName} stand on crypto.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export async function generateStaticParams() {
  return Object.keys(AU_STATE_CODE_TO_DISPLAY_NAME_MAP)
    .slice(0, toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION) ? 1 : 99999)
    .map(stateCode => ({
      stateCode: stateCode.toLowerCase(),
    }))
}

export default async function LocationHouseOfRepsSpecificPage({
  params,
}: LocationHouseOfRepsRaceSpecificPageProps) {
  const { stateCode: rawStateCode } = await params
  const stateCode = zodState.parse(rawStateCode.toUpperCase(), countryCode)
  const stateDisplayName = getAUStateNameFromStateCode(stateCode)

  const data = await queryDTSILocationHouseSpecificInformation({
    stateCode,
    countryCode,
  })

  if (!data) {
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
              name: 'House of Representatives',
            },
          ]}
        />
        <DarkHeroSection.Title>House of Representatives ({stateCode})</DarkHeroSection.Title>
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

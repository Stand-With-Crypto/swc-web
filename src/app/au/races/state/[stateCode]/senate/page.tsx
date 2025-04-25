import { compact, isEmpty } from 'lodash-es'
import { Metadata } from 'next'

import { organizeAURaceSpecificPeople } from '@/components/app/pageLocationKeyRaces/au/locationRaceSpecific/organizeRaceSpecificPeople'
import { DarkHeroSection } from '@/components/app/pageLocationKeyRaces/common/darkHeroSection'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common/locationRaces'
import { queryDTSILocationSenateSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationSenateSpecificInformation'
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

type LocationSenateRaceSpecificPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({
  params,
}: LocationSenateRaceSpecificPageProps): Promise<Metadata> {
  const { stateCode } = await params
  const validatedStateCode = zodState.parse(stateCode.toUpperCase(), countryCode)
  const stateName = getAUStateNameFromStateCode(validatedStateCode)
  const title = `${stateName} Australian Senate Race`
  const description = `See where politicians running for the Australian Senate in ${stateName} stand on crypto.`
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

export default async function LocationSenateSpecificPage({
  params,
}: LocationSenateRaceSpecificPageProps) {
  const { stateCode } = await params
  const validatedStateCode = zodState.parse(stateCode.toUpperCase(), countryCode)

  const data = await queryDTSILocationSenateSpecificInformation({
    stateCode: validatedStateCode,
    countryCode,
  })

  if (!data) {
    throw new Error(`Invalid params for LocationSenateSpecificPage: ${JSON.stringify(params)}`)
  }

  const groups = organizeAURaceSpecificPeople(data.people)
  const stateDisplayName = stateCode && AU_STATE_CODE_TO_DISPLAY_NAME_MAP[validatedStateCode]
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
          stateCode: validatedStateCode,
          countryCode,
        }}
      />

      <DarkHeroSection className="text-center">
        <DarkHeroSection.Breadcrumbs
          sections={[
            {
              name: COUNTRY_CODE_TO_DISPLAY_NAME[countryCode],
              url: urls.locationKeyRaces(),
            },
            {
              name: stateDisplayName,
              url: urls.locationStateSpecific(validatedStateCode),
            },
            {
              name: `Australian Senate (${stateDisplayName})`,
            },
          ]}
        />

        <DarkHeroSection.Title>{stateDisplayName} Australian Senate Race</DarkHeroSection.Title>
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
            />
          ))
        )}
      </LocationRaces.DetailedCandidateListContainer>
    </LocationRaces>
  )
}

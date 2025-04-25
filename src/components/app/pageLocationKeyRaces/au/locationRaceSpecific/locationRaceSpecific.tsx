import { compact, isEmpty } from 'lodash-es'

import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { MaybeOverflowedStances } from '@/components/app/maybeOverflowedStances'
import { organizeAURaceSpecificPeople } from '@/components/app/pageLocationKeyRaces/au/locationRaceSpecific/organizeRaceSpecificPeople'
import { DarkHeroSection } from '@/components/app/pageLocationKeyRaces/common/darkHeroSection'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common/locationRaces'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_DistrictSpecificInformationQuery } from '@/data/dtsi/generated'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { findRecommendedCandidate } from '@/utils/shared/findRecommendedCandidate'
import { COUNTRY_CODE_TO_DISPLAY_NAME } from '@/utils/shared/intl/displayNames'
import {
  AU_STATE_CODE_TO_DISPLAY_NAME_MAP,
  AUStateCode,
} from '@/utils/shared/stateMappings/auStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { AUUserActionViewKeyRacesCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'

const countryCode = SupportedCountryCodes.AU
const urls = getIntlUrls(countryCode)

interface AULocationRaceSpecificProps extends DTSI_DistrictSpecificInformationQuery {
  stateCode: AUStateCode
}

export function AULocationRaceSpecific({ stateCode, people }: AULocationRaceSpecificProps) {
  const groups = organizeAURaceSpecificPeople(people)
  const stateDisplayName = stateCode && AU_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]
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
          stateCode,
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
              url: urls.locationStateSpecific(stateCode),
            },
            {
              name: `Australian Senate (${stateCode})`,
            },
          ]}
        />

        <DarkHeroSection.Title>
          {stateCode ? `${stateDisplayName} Australian Senate Race` : 'Australian Senate Race'}
        </DarkHeroSection.Title>
      </DarkHeroSection>

      <div className="divide-y-2">
        {isEmpty(racesData) ? (
          <LocationRaces.EmptyMessage gutterTop>
            There's no key races currently in {stateDisplayName}
          </LocationRaces.EmptyMessage>
        ) : (
          racesData.map(({ person, isRecommended }) => (
            <div key={person.id}>
              <section className="mx-auto flex max-w-7xl flex-col px-6 md:flex-row">
                <div className="shrink-0 py-10 md:mr-16 md:border-r-2 md:py-20 md:pr-16">
                  <div className="sticky top-24 text-center">
                    <DTSIPersonHeroCard
                      countryCode={countryCode}
                      cryptoStanceGrade={DTSIFormattedLetterGrade}
                      isRecommended={isRecommended}
                      person={person}
                      subheader="role"
                    />
                  </div>
                </div>
                <div className="w-full py-10 md:py-20">
                  {person.stances.length ? (
                    <>
                      <PageTitle as="h3" className="mb-8 md:mb-14" size="sm">
                        {dtsiPersonFullName(person)} statements on crypto
                      </PageTitle>
                      <MaybeOverflowedStances
                        countryCode={countryCode}
                        person={person}
                        stances={person.stances}
                      />
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-center">
                      <h3 className="text-xl md:text-2xl">
                        {dtsiPersonFullName(person)} has no statements on crypto.
                      </h3>
                    </div>
                  )}
                </div>
              </section>
            </div>
          ))
        )}
      </div>
      <LocationRaces.PacFooter />
    </LocationRaces>
  )
}

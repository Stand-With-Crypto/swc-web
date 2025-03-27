'use client'

import { useEffect, useMemo } from 'react'
import { compact, isEmpty } from 'lodash-es'

import { actionCreateUserActionViewKeyRaces } from '@/actions/actionCreateUserActionViewKeyRaces'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { MaybeOverflowedStances } from '@/components/app/maybeOverflowedStances'
import { PACFooter } from '@/components/app/pacFooter'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import {
  DTSI_DistrictSpecificInformationQuery,
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'
import { NormalizedDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { formatSpecificRoleDTSIPerson } from '@/utils/dtsi/specificRoleDTSIPerson'
import { findRecommendedCandidate } from '@/utils/shared/findRecommendedCandidate'
import {
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface LocationRaceGovernorSpecificProps extends DTSI_DistrictSpecificInformationQuery {
  stateCode?: USStateCode
  district?: NormalizedDTSIDistrictId
  countryCode: SupportedCountryCodes
  isGovernor?: boolean
}

function organizeRaceSpecificPeople(
  people: DTSI_DistrictSpecificInformationQuery['people'],
  {
    district,
    stateCode,
    isGovernor,
  }: Pick<LocationRaceGovernorSpecificProps, 'district' | 'stateCode' | 'isGovernor'>,
) {
  let targetedRoleCategory = DTSI_PersonRoleCategory.PRESIDENT

  if (district) {
    targetedRoleCategory = DTSI_PersonRoleCategory.CONGRESS
  } else if (stateCode) {
    targetedRoleCategory = isGovernor
      ? DTSI_PersonRoleCategory.GOVERNOR
      : DTSI_PersonRoleCategory.SENATE
  }

  const formatted = people.map(x =>
    formatSpecificRoleDTSIPerson(x, {
      specificRole: targetedRoleCategory,
    }),
  )

  const partyOrder = [
    DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
    DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
    DTSI_PersonPoliticalAffiliationCategory.INDEPENDENT,
  ]

  formatted.sort((a, b) => {
    const aPartyIndex = a.politicalAffiliationCategory
      ? partyOrder.indexOf(a.politicalAffiliationCategory)
      : -1
    const bPartyIndex = b.politicalAffiliationCategory
      ? partyOrder.indexOf(b.politicalAffiliationCategory)
      : -1
    const aPersonScore = a.computedStanceScore || a.manuallyOverriddenStanceScore || 0
    const bPersonScore = b.computedStanceScore || b.manuallyOverriddenStanceScore || 0

    if (aPersonScore !== bPersonScore) {
      return bPersonScore - aPersonScore
    }

    if (a.profilePictureUrl !== b.profilePictureUrl) {
      return a.profilePictureUrl ? -1 : 1
    }

    if (aPartyIndex !== bPartyIndex) {
      return aPartyIndex - bPartyIndex
    }

    if (a.primaryRole?.roleCategory !== b.primaryRole?.roleCategory) {
      return a.primaryRole?.roleCategory === DTSI_PersonRoleCategory.PRESIDENT ? -1 : 1
    }

    return 0
  })

  return formatted
}

export function LocationRaceGovernorSpecific({
  stateCode,
  district,
  people,
  countryCode,
  isGovernor,
}: LocationRaceGovernorSpecificProps) {
  const groups = organizeRaceSpecificPeople(people, { district, stateCode, isGovernor })
  const stateDisplayName = stateCode && US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]
  const urls = getIntlUrls(countryCode)
  const { recommended, others } = findRecommendedCandidate(groups)

  useEffect(() => {
    void actionCreateUserActionViewKeyRaces({
      usaState: stateCode,
      usCongressionalDistrict: district?.toString(),
    })
  }, [district, stateCode])

  const racesData = useMemo(
    () =>
      compact([
        recommended && { person: recommended, isRecommended: true },
        ...others.map(person => ({ person, isRecommended: false })),
      ]),
    [others, recommended],
  )

  return (
    <div>
      <DarkHeroSection className="text-center">
        <h2 className={'mb-4'}>
          <InternalLink className="text-gray-400" href={urls.locationKeyRaces()}>
            United States
          </InternalLink>
          {' / '}
          {(() => {
            if (!stateDisplayName) {
              return <span>Presidential</span>
            }
            return (
              <span>
                {district
                  ? `${stateCode} Congressional District ${district}`
                  : isGovernor
                    ? `Governors (${stateCode})`
                    : `U.S. Senate (${stateCode})`}
              </span>
            )
          })()}
        </h2>
        <PageTitle as="h1" className="mb-4" size="md">
          {!stateCode
            ? 'U.S. Presidential Race'
            : district
              ? `${stateCode} Congressional District ${district}`
              : isGovernor
                ? `Governors (${stateCode})`
                : `U.S. Senate (${stateCode})`}
        </PageTitle>
        <UserActionFormVoterRegistrationDialog initialStateCode={stateCode}>
          <Button className="mt-6 w-full max-w-xs" variant="secondary">
            Make sure you're registered to vote
          </Button>
        </UserActionFormVoterRegistrationDialog>
      </DarkHeroSection>
      <div className="divide-y-2">
        {isEmpty(racesData) ? (
          <PageTitle as="h3" className="mt-20" size="sm">
            There's no key races currently in {stateDisplayName}
          </PageTitle>
        ) : (
          racesData.map(({ person, isRecommended }) => (
            <div key={person.id}>
              <section className="mx-auto flex max-w-7xl flex-col px-6 md:flex-row">
                <div className="shrink-0 py-10 md:mr-16 md:border-r-2 md:py-20 md:pr-16">
                  <div className="sticky top-24 text-center">
                    <DTSIPersonHeroCard
                      countryCode={countryCode}
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
      <PACFooter className="container" />
    </div>
  )
}

'use client'

import { useEffect, useMemo } from 'react'
import { compact } from 'lodash-es'

import { actionCreateUserActionViewKeyRaces } from '@/actions/actionCreateUserActionViewKeyRaces'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { MaybeOverflowedStances } from '@/components/app/maybeOverflowedStances'
import { PACFooter } from '@/components/app/pacFooter'
import { organizeRaceSpecificPeople } from '@/components/app/pageLocationKeyRaces/locationRaceSpecific/organizeRaceSpecificPeople'
import { KeyRaceLiveResult } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/keyRaceLiveResult'
import { PresidentialRaceResult } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/presidentialRaceResult'
import { isPresidentialData } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/utils'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import {
  PresidentialDataWithVotingResponse,
  RacesVotingDataResponse,
} from '@/data/aggregations/decisionDesk/types'
import { DTSI_DistrictSpecificInformationQuery } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { NormalizedDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { findRecommendedCandidate } from '@/utils/shared/findRecommendedCandidate'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'

interface LocationRaceSpecificProps extends DTSI_DistrictSpecificInformationQuery {
  stateCode?: USStateCode
  district?: NormalizedDTSIDistrictId
  locale: SupportedLocale
  initialLiveResultData: RacesVotingDataResponse[] | PresidentialDataWithVotingResponse[] | null
}

export function LocationRaceSpecific({
  stateCode,
  district,
  people,
  locale,
  initialLiveResultData,
}: LocationRaceSpecificProps) {
  const groups = organizeRaceSpecificPeople(people, { district, stateCode })
  const stateDisplayName = stateCode && US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]
  const urls = getIntlUrls(locale)
  const { recommended, others } = findRecommendedCandidate(groups)

  const candidates = useMemo(
    () =>
      compact([
        recommended && { person: recommended, isRecommended: true },
        ...others.map(person => ({ person, isRecommended: false })),
      ]),
    [others, recommended],
  )

  useEffect(() => {
    void actionCreateUserActionViewKeyRaces({
      usaState: stateCode,
      usCongressionalDistrict: district?.toString(),
    })
  }, [district, stateCode])

  return (
    <div>
      <DarkHeroSection className="text-center">
        <h2 className={'mb-4'}>
          <InternalLink className="text-gray-400" href={urls.locationUnitedStates()}>
            United States
          </InternalLink>
          {' / '}
          {(() => {
            if (!stateDisplayName) {
              return <span>Presidential</span>
            }
            return (
              <>
                <InternalLink
                  className="text-gray-400"
                  href={urls.locationStateSpecific(stateCode)}
                >
                  {stateDisplayName}
                </InternalLink>{' '}
                /{' '}
                <span>
                  {district
                    ? `${stateCode} Congressional District ${district}`
                    : `U.S. Senate (${stateCode})`}
                </span>
              </>
            )
          })()}
        </h2>
        <PageTitle as="h1" className="mb-4" size="md">
          {!stateCode
            ? 'U.S. Presidential Race'
            : district
              ? `${stateCode} Congressional District ${district}`
              : `U.S. Senate (${stateCode})`}
        </PageTitle>
        <UserActionFormVoterRegistrationDialog initialStateCode={stateCode}>
          <Button className="mt-6 w-full max-w-xs" variant="secondary">
            Make sure you're registered to vote
          </Button>
        </UserActionFormVoterRegistrationDialog>
      </DarkHeroSection>

      <div className="divide-y-2">
        <div className="mx-auto mb-20 mt-20 flex w-full max-w-2xl justify-center px-6">
          {isPresidentialData(initialLiveResultData) ? (
            <PresidentialRaceResult
              candidates={candidates.map(({ person }) => person)}
              initialRaceData={initialLiveResultData}
            />
          ) : (
            <KeyRaceLiveResult
              candidates={candidates.map(({ person, isRecommended }) => ({
                ...person,
                isRecommended,
              }))}
              initialRaceData={initialLiveResultData || undefined}
              locale={locale}
              primaryDistrict={district}
              stateCode={stateCode || ('' as USStateCode)}
            />
          )}
        </div>

        <div className="divide-y-2">
          {candidates.map(({ person, isRecommended }) => (
            <div key={person.id}>
              <section className="mx-auto flex max-w-7xl flex-col px-6 md:flex-row">
                <div className="shrink-0 py-10 md:mr-16 md:border-r-2 md:py-20 md:pr-16">
                  <div className="sticky top-24 text-center">
                    <DTSIPersonHeroCard
                      isRecommended={isRecommended}
                      locale={locale}
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
                        locale={locale}
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
          ))}
        </div>
      </div>

      <PACFooter className="container" />
    </div>
  )
}

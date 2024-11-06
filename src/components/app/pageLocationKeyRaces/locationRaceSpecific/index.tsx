'use client'

import { useMemo } from 'react'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { DDHQFooter } from '@/components/app/ddhqFooter'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { MaybeOverflowedStances } from '@/components/app/maybeOverflowedStances'
import { PACFooter } from '@/components/app/pacFooter'
import { organizeRaceSpecificPeople } from '@/components/app/pageLocationKeyRaces/locationRaceSpecific/organizeRaceSpecificPeople'
import { KeyRaceLiveResult } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/LiveResultCard/keyRaceLiveResultCard'
import { PresidentialRaceResult } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/presidentialRaceResult'
import { isPresidentialData } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/utils'
import { UserActionVotingDayDialog } from '@/components/app/userActionVotingDay/dialog'
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
import { possessive } from '@/utils/shared/possessive'
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

  const candidates = useMemo(() => {
    const candidatesArray = others.map(person => ({ person, isRecommended: false }))
    if (recommended) {
      candidatesArray.unshift({ person: recommended, isRecommended: true })
    }
    return candidatesArray
  }, [others, recommended])

  return (
    <div className="space-y-20 xl:space-y-28">
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
        <LoginDialogWrapper
          authenticatedContent={
            <UserActionVotingDayDialog>
              <Button className="mt-6 w-full max-w-xs" variant="secondary">
                Claim I Voted NFT
              </Button>
            </UserActionVotingDayDialog>
          }
        >
          <Button className="mt-6 w-full max-w-xs" variant="secondary">
            Join Stand With Crypto
          </Button>
        </LoginDialogWrapper>
      </DarkHeroSection>

      <div className="divide-y-2">
        <div className="mx-auto mb-20 mt-20 flex w-full max-w-2xl justify-center px-6">
          {isPresidentialData(initialLiveResultData) ? (
            <PresidentialRaceResult
              candidates={candidates.map(({ person }) => person)}
              initialRaceData={initialLiveResultData}
              locale={locale}
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
                        {possessive(dtsiPersonFullName(person))} statements on crypto
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

      <PACFooter className="container text-center" />
      <DDHQFooter className="container text-center" />
    </div>
  )
}

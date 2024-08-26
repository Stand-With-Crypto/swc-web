'use client'

import { useEffect } from 'react'
import { compact } from 'lodash-es'

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
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { NormalizedDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { formatSpecificRoleDTSIPerson } from '@/utils/dtsi/specificRoleDTSIPerson'
import { findRecommendedCandidate } from '@/utils/shared/findRecommendedCandidate'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'

interface LocationRaceSpecificProps extends DTSI_DistrictSpecificInformationQuery {
  stateCode?: USStateCode
  district?: NormalizedDTSIDistrictId
  locale: SupportedLocale
}

function organizeRaceSpecificPeople(
  people: DTSI_DistrictSpecificInformationQuery['people'],
  { district, stateCode }: Pick<LocationRaceSpecificProps, 'district' | 'stateCode'>,
) {
  const targetedRoleCategory = district
    ? DTSI_PersonRoleCategory.CONGRESS
    : stateCode
      ? DTSI_PersonRoleCategory.SENATE
      : DTSI_PersonRoleCategory.PRESIDENT

  const formatted = people.map(x =>
    formatSpecificRoleDTSIPerson(x, {
      specificRole: targetedRoleCategory,
    }),
  )
  formatted.sort((a, b) => (a.isIncumbent === b.isIncumbent ? 0 : a.isIncumbent ? -1 : 1))
  return formatted
}

export function LocationRaceSpecific({
  stateCode,
  district,
  people,
  locale,
}: LocationRaceSpecificProps) {
  const groups = organizeRaceSpecificPeople(people, { district, stateCode })
  const stateDisplayName = stateCode && US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]
  const urls = getIntlUrls(locale)
  const { recommended, others } = findRecommendedCandidate(groups)

  useEffect(() => {
    async function viewKeyRaces() {
      await actionCreateUserActionViewKeyRaces({
        usaState: stateCode,
        usCongressionalDistrict: district?.toString(),
      })
    }

    void viewKeyRaces()
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
        {compact([
          recommended && { person: recommended, isRecommended: true },
          ...others.map(person => ({ person, isRecommended: false })),
        ]).map(({ person, isRecommended }) => (
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
      <PACFooter className="container" />
    </div>
  )
}

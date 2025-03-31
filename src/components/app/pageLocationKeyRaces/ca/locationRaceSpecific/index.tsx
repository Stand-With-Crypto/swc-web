'use client'

import { useEffect, useMemo } from 'react'
import { compact, isEmpty } from 'lodash-es'

import { actionCreateUserActionViewKeyRaces } from '@/actions/actionCreateUserActionViewKeyRaces'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { MaybeOverflowedStances } from '@/components/app/maybeOverflowedStances'
import { caFormatSpecificRoleDTSIPerson } from '@/components/app/pageLocationKeyRaces/ca/locationCanada/specificRoleDTSIPerson'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import {
  DTSI_DistrictSpecificInformationQuery,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { findRecommendedCandidate } from '@/utils/shared/findRecommendedCandidate'
import {
  CAProvinceOrTerritoryCode,
  getCAProvinceOrTerritoryNameFromCode,
} from '@/utils/shared/stateMappings/caProvinceUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface CALocationRaceSpecificProps extends DTSI_DistrictSpecificInformationQuery {
  stateCode: CAProvinceOrTerritoryCode
  isSenate?: boolean
}

const countryCode = SupportedCountryCodes.CA

function organizeRaceSpecificPeople(people: DTSI_DistrictSpecificInformationQuery['people']) {
  const formatted = people.map(x => caFormatSpecificRoleDTSIPerson(x))

  formatted.sort((a, b) => {
    const aPersonScore = a.computedStanceScore || a.manuallyOverriddenStanceScore || 0
    const bPersonScore = b.computedStanceScore || b.manuallyOverriddenStanceScore || 0

    if (aPersonScore !== bPersonScore) {
      return bPersonScore - aPersonScore
    }

    if (a.profilePictureUrl !== b.profilePictureUrl) {
      return a.profilePictureUrl ? -1 : 1
    }

    if (a.primaryRole?.roleCategory !== b.primaryRole?.roleCategory) {
      return a.primaryRole?.roleCategory === DTSI_PersonRoleCategory.PRESIDENT ? -1 : 1
    }

    return 0
  })

  return formatted
}

export function CALocationRaceSpecific({
  stateCode,
  people,
  isSenate,
}: CALocationRaceSpecificProps) {
  const groups = organizeRaceSpecificPeople(people)
  const stateDisplayName = stateCode && getCAProvinceOrTerritoryNameFromCode(stateCode)
  const urls = getIntlUrls(countryCode)
  const { recommended, others } = findRecommendedCandidate(groups)

  useEffect(() => {
    void actionCreateUserActionViewKeyRaces({
      stateCode,
    })
  }, [stateCode])

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
            Canada
          </InternalLink>
          {' / '}
          <LocationRaceLinkTitle
            href={urls.locationStateSpecific(stateCode)}
            isSenate={isSenate}
            stateDisplayName={stateDisplayName}
          />
        </h2>
        <PageTitle as="h1" className="mb-4" size="md">
          {isSenate ? 'Canadian Senate' : 'Canadian House of Commons'}
        </PageTitle>
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
    </div>
  )
}

function LocationRaceLinkTitle({
  href,
  stateDisplayName,
  isSenate,
}: {
  href: string
  stateDisplayName: string
  isSenate?: boolean
}) {
  return (
    <>
      <InternalLink className="text-gray-400" href={href}>
        {stateDisplayName}
      </InternalLink>{' '}
      / <span>{isSenate ? 'Canadian Senate' : 'Canadian House of Commons'}</span>
    </>
  )
}

import React from 'react'

import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { MaybeOverflowedStances } from '@/components/app/maybeOverflowedStances'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_HouseSpecificInformationQuery } from '@/data/dtsi/generated'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface LocationRacesDetailedCandidateListItemProps {
  person: DTSI_HouseSpecificInformationQuery['people'][number]
  isRecommended: boolean
  countryCode: SupportedCountryCodes
}

export function LocationRacesDetailedCandidateListItem({
  person,
  isRecommended,
  countryCode,
}: LocationRacesDetailedCandidateListItemProps) {
  return (
    <section className="mx-auto flex max-w-7xl flex-col px-6 md:flex-row md:border-b-2">
      <div className="shrink-0 py-2 md:mr-16 md:border-r-2 md:py-20 md:pr-16">
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
      <div className="w-full py-20 max-md:hidden">
        {person.stances.length ? (
          <>
            <PageTitle as="p" className="mb-8 md:mb-14" size="sm">
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
  )
}

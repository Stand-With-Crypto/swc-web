'use client'

import { PetitionCard } from '@/components/app/pagePetitions/common/card'
import * as PetitionsSection from '@/components/app/pagePetitions/common/section'
import {
  PetitionsHeaderSection,
  PetitionsWrapper,
} from '@/components/app/pagePetitions/common/wrapper'
import { isPetitionSigned } from '@/components/app/pagePetitions/shared/isPetitionSigned'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'
import { cn } from '@/utils/web/cn'

interface PetitionsContentProps {
  title: string
  description: string
  currentPetitions: SWCPetition[]
  pastPetitions: SWCPetition[]
  countryCode: SupportedCountryCodes
  locale: SupportedLocale
}

export function UsPetitionsContent({
  title,
  description,
  currentPetitions,
  pastPetitions,
  countryCode,
  locale,
}: PetitionsContentProps) {
  const { data: userData } = useApiResponseForUserFullProfileInfo()

  return (
    <PetitionsWrapper>
      <PetitionsHeaderSection>
        <PageTitle>{title}</PageTitle>
        <PageSubTitle>{description}</PageSubTitle>
      </PetitionsHeaderSection>

      <PetitionsSection.Root>
        <PetitionsSection.Title>
          {currentPetitions.length > 0 ? 'Current Petitions' : 'There are no current petitions'}
        </PetitionsSection.Title>
        <PetitionsSection.Grid>
          {currentPetitions.map(petition => (
            <PetitionCard
              countryCode={countryCode}
              isSigned={isPetitionSigned({ userData, petition })}
              key={petition.slug}
              locale={locale}
              petition={petition}
              variant={'current'}
            />
          ))}
        </PetitionsSection.Grid>
      </PetitionsSection.Root>

      <PetitionsSection.Root className={cn(pastPetitions.length <= 0 && 'hidden')}>
        <PetitionsSection.Title>Past Petitions</PetitionsSection.Title>
        <PetitionsSection.Grid>
          {pastPetitions.map(petition => (
            <PetitionCard
              countryCode={countryCode}
              isSigned={isPetitionSigned({ userData, petition })}
              key={petition.slug}
              locale={locale}
              petition={petition}
              variant={'past'}
            />
          ))}
        </PetitionsSection.Grid>
      </PetitionsSection.Root>
    </PetitionsWrapper>
  )
}

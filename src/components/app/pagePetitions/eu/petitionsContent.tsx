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
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'
import { cn } from '@/utils/web/cn'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

interface PetitionsContentProps {
  title: string
  description: string
  currentPetitions: SWCPetition[]
  pastPetitions: SWCPetition[]
  countryCode: SupportedCountryCodes
  locale: SupportedLocale
}

const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      currentPetitions: 'Current Petitions',
      noCurrentPetitions: 'There are no current petitions',
      pastPetitions: 'Past Petitions',
    },
    de: {
      currentPetitions: 'Aktuelle Petitionen',
      noCurrentPetitions: 'Es gibt keine aktuellen Petitionen',
      pastPetitions: 'Vergangene Petitionen',
    },
    fr: {
      currentPetitions: 'Pétitions en cours',
      noCurrentPetitions: "Il n'y a pas de pétitions en cours",
      pastPetitions: 'Pétitions passées',
    },
  },
})

export function EuPetitionsContent({
  title,
  description,
  currentPetitions,
  pastPetitions,
  countryCode,
  locale,
}: PetitionsContentProps) {
  const { t } = useTranslation(i18nMessages, 'EuPetitionsContent')
  const { data: userData } = useApiResponseForUserFullProfileInfo()

  return (
    <PetitionsWrapper>
      <PetitionsHeaderSection>
        <PageTitle>{title}</PageTitle>
        <PageSubTitle>{description}</PageSubTitle>
      </PetitionsHeaderSection>

      <PetitionsSection.Root>
        <PetitionsSection.Title>
          {currentPetitions.length > 0 ? t('currentPetitions') : t('noCurrentPetitions')}
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
        <PetitionsSection.Title>{t('pastPetitions')}</PetitionsSection.Title>
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

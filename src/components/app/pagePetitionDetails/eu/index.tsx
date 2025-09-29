import React from 'react'

import { EuPagePetitionDetailsContent } from '@/components/app/pagePetitionDetails/eu/content'
import { EuPagePetitionDetailsWithDebugger } from '@/components/app/pagePetitionDetails/eu/pagePetitionDetailsWithDebugger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'

interface PagePetitionDetailsProps {
  petition: SWCPetition
  countryCode: SupportedCountryCodes
  language: SupportedLanguages
  recentSignatures: Array<{
    locale: string
    datetimeSigned: string
  }>
}

const isStaging = NEXT_PUBLIC_ENVIRONMENT !== 'production'

export function EuPagePetitionDetails({
  petition,
  countryCode,
  language,
  recentSignatures,
}: PagePetitionDetailsProps) {
  if (isStaging) {
    return (
      <EuPagePetitionDetailsWithDebugger
        countryCode={countryCode}
        language={language}
        petition={petition}
        recentSignatures={recentSignatures}
      />
    )
  }

  return (
    <EuPagePetitionDetailsContent
      countryCode={countryCode}
      language={language}
      petition={petition}
      recentSignatures={recentSignatures}
    />
  )
}

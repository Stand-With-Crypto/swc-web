'use client'

import { CountryCodeContext } from '@/hooks/useCountryCode'
import { usePromoteDevParticipation } from '@/hooks/usePromoteDevParticipation'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

// This component includes all top level client-side logic
export function TopLevelEmbeddedClientLogic({
  children,
  countryCode,
}: {
  children: React.ReactNode
  countryCode: SupportedCountryCodes
}) {
  usePromoteDevParticipation()

  return <CountryCodeContext.Provider value={countryCode}>{children}</CountryCodeContext.Provider>
}

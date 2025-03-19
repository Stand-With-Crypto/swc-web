'use client'

import { useSearchParams } from 'next/navigation'

import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

import { UserActionFormShareOnTwitterDialog } from './dialog'

export function HomepageShareOnXDialogDeeplinkWrapper({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const shouldOpenDialog = searchParams?.get('action') === 'tweet'
  const countryCode =
    (searchParams?.get('country') as SupportedCountryCodes) || DEFAULT_SUPPORTED_COUNTRY_CODE

  return (
    <UserActionFormShareOnTwitterDialog countryCode={countryCode} defaultOpen={!!shouldOpenDialog}>
      {children}
    </UserActionFormShareOnTwitterDialog>
  )
}

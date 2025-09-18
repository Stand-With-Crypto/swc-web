import React from 'react'

import { ManageCookiesModal } from '@/components/app/cookieConsent/common/manageCookiesModal'
import {
  EU_DEFAULT_VALUES,
  EU_FIELDS_CONFIG,
} from '@/components/app/cookieConsent/eu/cookiePreferencesForm'
import { CookieConsentPermissions } from '@/utils/shared/cookieConsent'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface EUManageCookiesModalProps {
  children: React.ReactNode
  onSubmit: (accepted: CookieConsentPermissions) => void
}

export function EUManageCookiesModal({ children, onSubmit }: EUManageCookiesModalProps) {
  return (
    <ManageCookiesModal
      countryCode={SupportedCountryCodes.EU}
      defaultValues={EU_DEFAULT_VALUES}
      fieldsConfig={EU_FIELDS_CONFIG}
      onSubmit={onSubmit}
    >
      <div>{children}</div>
    </ManageCookiesModal>
  )
}

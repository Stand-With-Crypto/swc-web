import React from 'react'

import { ManageCookiesModal } from '@/components/app/cookieConsent/common/manageCookiesModal'
import {
  US_DEFAULT_VALUES,
  US_FIELDS_CONFIG,
} from '@/components/app/cookieConsent/us/cookiePreferencesForm'
import { CookieConsentPermissions } from '@/utils/shared/cookieConsent'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface USManageCookiesModalProps {
  children: React.ReactNode
  onSubmit: (accepted: CookieConsentPermissions) => void
}

export function USManageCookiesModal({ children, onSubmit }: USManageCookiesModalProps) {
  return (
    <ManageCookiesModal
      countryCode={SupportedCountryCodes.US}
      defaultValues={US_DEFAULT_VALUES}
      fieldsConfig={US_FIELDS_CONFIG}
      onSubmit={onSubmit}
    >
      <div>{children}</div>
    </ManageCookiesModal>
  )
}

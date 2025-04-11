import React from 'react'

import { ManageCookiesModal } from '@/components/app/cookieConsent/common/manageCookiesModal'
import {
  GB_DEFAULT_VALUES,
  GB_FIELDS_CONFIG,
} from '@/components/app/cookieConsent/gb/cookiePreferencesForm'
import { CookieConsentPermissions } from '@/utils/shared/cookieConsent'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface GBManageCookiesModalProps {
  children: React.ReactNode
  onSubmit: (accepted: CookieConsentPermissions) => void
}

export function GBManageCookiesModal({ children, onSubmit }: GBManageCookiesModalProps) {
  return (
    <ManageCookiesModal
      countryCode={SupportedCountryCodes.GB}
      defaultValues={GB_DEFAULT_VALUES}
      fieldsConfig={GB_FIELDS_CONFIG}
      onSubmit={onSubmit}
    >
      <div>{children}</div>
    </ManageCookiesModal>
  )
}

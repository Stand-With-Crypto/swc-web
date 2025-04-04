import React from 'react'

import {
  CA_DEFAULT_VALUES,
  CA_FIELDS_CONFIG,
} from '@/components/app/cookieConsent/ca/cookiePreferencesForm'
import { ManageCookiesModal } from '@/components/app/cookieConsent/common/manageCookiesModal'
import { CookieConsentPermissions } from '@/utils/shared/cookieConsent'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface CAManageCookiesModalProps {
  children: React.ReactNode
  onSubmit: (accepted: CookieConsentPermissions) => void
}

export function CAManageCookiesModal({ children, onSubmit }: CAManageCookiesModalProps) {
  return (
    <ManageCookiesModal
      countryCode={SupportedCountryCodes.CA}
      defaultValues={CA_DEFAULT_VALUES}
      fieldsConfig={CA_FIELDS_CONFIG}
      onSubmit={onSubmit}
    >
      <div>{children}</div>
    </ManageCookiesModal>
  )
}

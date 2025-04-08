import React from 'react'

import {
  AU_DEFAULT_VALUES,
  AU_FIELDS_CONFIG,
} from '@/components/app/cookieConsent/au/cookiePreferencesForm'
import { ManageCookiesModal } from '@/components/app/cookieConsent/common/manageCookiesModal'
import { CookieConsentPermissions } from '@/utils/shared/cookieConsent'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface AUManageCookiesModalProps {
  children: React.ReactNode
  onSubmit: (accepted: CookieConsentPermissions) => void
}

export function AUManageCookiesModal({ children, onSubmit }: AUManageCookiesModalProps) {
  return (
    <ManageCookiesModal
      countryCode={SupportedCountryCodes.AU}
      defaultValues={AU_DEFAULT_VALUES}
      fieldsConfig={AU_FIELDS_CONFIG}
      onSubmit={onSubmit}
    >
      <div>{children}</div>
    </ManageCookiesModal>
  )
}

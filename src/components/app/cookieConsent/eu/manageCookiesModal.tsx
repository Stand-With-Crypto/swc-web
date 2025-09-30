import React from 'react'

import { ManageCookiesModal } from '@/components/app/cookieConsent/common/manageCookiesModal'
import {
  EU_DEFAULT_VALUES,
  getEuFieldsConfig,
} from '@/components/app/cookieConsent/eu/cookiePreferencesForm'
import { CookieConsentPermissions } from '@/utils/shared/cookieConsent'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { useLanguage } from '@/utils/web/i18n/useLanguage'

interface EUManageCookiesModalProps {
  children: React.ReactNode
  onSubmit: (accepted: CookieConsentPermissions) => void
}

export function EUManageCookiesModal({ children, onSubmit }: EUManageCookiesModalProps) {
  const language = useLanguage()

  return (
    <ManageCookiesModal
      countryCode={SupportedCountryCodes.EU}
      defaultValues={EU_DEFAULT_VALUES}
      fieldsConfig={getEuFieldsConfig(language)}
      onSubmit={onSubmit}
    >
      <div>{children}</div>
    </ManageCookiesModal>
  )
}

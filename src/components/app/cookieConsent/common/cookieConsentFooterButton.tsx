'use client'

import { useCookieConsent } from '@/components/app/cookieConsent/useCookieConsent'
import { Button, ButtonProps } from '@/components/ui/button'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      label: 'Cookie Preference & Privacy Choices',
    },
    de: {
      label: 'Cookie-Einstellungen & Datenschutz-Einstellungen',
    },
    fr: {
      label: 'Préférences des cookies & choix de confidentialité',
    },
  },
})

export function CookieConsentFooterButton(props: ButtonProps) {
  const { t } = useTranslation(i18nMessages, 'CookieConsentFooterButton')
  const { resetCookieConsent } = useCookieConsent()

  return (
    <Button
      {...props}
      onClick={e => {
        resetCookieConsent()
        window.location.reload()
        props?.onClick?.(e)
      }}
    >
      {t('label')}
    </Button>
  )
}

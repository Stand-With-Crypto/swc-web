'use client'

import { CookieConsentBanner } from '@/components/app/cookieConsent/common/banner'
import { CookieConsentBannerProps } from '@/components/app/cookieConsent/common/types'
import { EUManageCookiesModal } from '@/components/app/cookieConsent/eu/manageCookiesModal'
import { InternalLink } from '@/components/ui/link'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

const urls = getIntlUrls(SupportedCountryCodes.EU)

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      consentText:
        'We use our own and third-party cookies on our website to enhance your experience, analyze traffic, for marketing, and for security. We require your consent for optional cookies that are not strictly necessary. You may opt in to these optional cookies by choosing from the below options. For more information, visit our',
      privacyPolicy: 'Privacy Policy',
      manageCookies: 'Manage Cookies',
    },
    de: {
      consentText:
        'Wir verwenden eigene und fremde Cookies auf unserer Website, um Ihr Erlebnis zu verbessern, den Datenverkehr zu analysieren, für Marketing und Sicherheit. Wir benötigen Ihre Zustimmung für optionale Cookies, die nicht streng notwendig sind. Sie können diese optionalen Cookies durch Auswahl der unten stehenden Optionen aktivieren. Weitere Informationen finden Sie in unserer',
      privacyPolicy: 'Datenschutzrichtlinie',
      manageCookies: 'Cookies verwalten',
    },
    fr: {
      consentText:
        "Nous utilisons nos propres et des cookies tiers sur notre site web pour améliorer votre expérience, analyser le trafic, pour le marketing et la sécurité. Nous avons besoin de votre consentement pour les cookies optionnels qui ne sont pas strictement nécessaires. Vous pouvez activer ces cookies optionnels en choisissant parmi les options ci-dessous. Pour plus d'informations, visitez notre",
      privacyPolicy: 'Politique de confidentialité',
      manageCookies: 'Gérer les cookies',
    },
  },
})

export function EUCookieConsentBanner({
  onAcceptSpecificCookies,
  onAcceptAll,
  onRejectAll,
}: CookieConsentBannerProps) {
  const { t } = useTranslation(i18nMessages, 'EUCookieConsentBanner')

  return (
    <CookieConsentBanner>
      <CookieConsentBanner.Content onRejectAll={onRejectAll}>
        <p className={cn('max-w-2xl text-justify text-xs text-muted-foreground md:text-left')}>
          {t('consentText')}{' '}
          <InternalLink className="underline" href={urls.privacyPolicy()}>
            {t('privacyPolicy')}
          </InternalLink>
          .
        </p>
      </CookieConsentBanner.Content>
      <CookieConsentBanner.Footer onAcceptAll={onAcceptAll} onRejectAll={onRejectAll}>
        <EUManageCookiesModal onSubmit={onAcceptSpecificCookies}>
          <CookieConsentBanner.ManageCookiesButton>
            {t('manageCookies')}
          </CookieConsentBanner.ManageCookiesButton>
        </EUManageCookiesModal>
      </CookieConsentBanner.Footer>
    </CookieConsentBanner>
  )
}

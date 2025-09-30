'use client'

import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { requiresOptInConfirmation } from '@/utils/shared/sms/smsSupportedCountries'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      consentWithButton: 'By clicking {buttonText}, {consentText}',
      consentWithCheckbox: 'By checking this box, {consentText}',
      consentTextDefault:
        'I authorize SWC International Ltd and its service providers to contact me at this number via text (SMS) for cryptocurrency advocacy purposes. Message and data rates may apply. To opt-out at any time reply "STOP".',
    },
    de: {
      consentWithButton: 'Durch Klicken auf {buttonText}, {consentText}',
      consentWithCheckbox: 'Durch Ankreuzen dieses Kästchens {consentText}',
      consentTextDefault:
        'autorisiere ich SWC International Ltd und seine Dienstleister, mich unter dieser Nummer per SMS für Kryptowährungs-Advocacy-Zwecke zu kontaktieren. Nachrichten- und Datenraten können anfallen. Um sich jederzeit abzumelden, antworten Sie "STOP".',
    },
    fr: {
      consentWithButton: 'En cliquant sur {buttonText}, {consentText}',
      consentWithCheckbox: 'En cochant cette case, {consentText}',
      consentTextDefault:
        'j\'autorise SWC International Ltd et ses fournisseurs de services à me contacter à ce numéro par SMS à des fins de plaidoyer pour les cryptomonnaies. Des frais de message et de données peuvent s\'appliquer. Pour vous désabonner à tout moment, répondez "STOP".',
    },
  },
  messagesOverrides: {
    us: {
      en: {
        consentTextDefault:
          'you consent to receive recurring texts from Stand With Crypto. You can reply STOP to stop receiving texts. Message and data rates may apply.',
      },
    },
  },
})

export function SMSOptInConsentText({
  countryCode,
  consentButtonText,
}: {
  countryCode: SupportedCountryCodes
  consentButtonText?: string
}) {
  const { t } = useTranslation(i18nMessages, 'SMSOptInConsentText')

  const consentText = t('consentTextDefault')

  if (consentButtonText && !requiresOptInConfirmation(countryCode)) {
    return t('consentWithButton', { buttonText: consentButtonText, consentText })
  }

  return t('consentWithCheckbox', { consentText })
}

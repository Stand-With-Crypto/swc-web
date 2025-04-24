import { requiresOptInConfirmation } from '@/utils/shared/sms/smsSupportedCountries'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const SMS_OPT_IN_CONSENT: Record<SupportedCountryCodes, string> = {
  [SupportedCountryCodes.US]:
    'consent to receive recurring texts from Stand With Crypto. You can reply STOP to stop receiving texts. Message and data rates may apply.',
  [SupportedCountryCodes.GB]:
    'consent to receive recurring texts from Stand With Crypto. You can reply STOP to stop receiving texts. Message and data rates may apply.',
  [SupportedCountryCodes.CA]:
    'consent to receive recurring texts from Stand With Crypto. You can reply STOP to stop receiving texts. Message and data rates may apply.',
  [SupportedCountryCodes.AU]:
    'consent to receive recurring texts from Stand With Crypto. You can reply STOP to stop receiving texts. Message and data rates may apply.',
}

export function SMSOptInConsentText({
  countryCode,
  consentButtonText,
}: {
  countryCode: SupportedCountryCodes
  consentButtonText?: string
}) {
  if (consentButtonText && !requiresOptInConfirmation(countryCode)) {
    return `By clicking ${consentButtonText}, you ${SMS_OPT_IN_CONSENT[countryCode]}`
  }

  return `I ${SMS_OPT_IN_CONSENT[countryCode]}`
}

import { requiresOptInConfirmation } from '@/utils/shared/sms/smsSupportedCountries'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const SMS_OPT_IN_CONSENT: Record<SupportedCountryCodes, string> = {
  [SupportedCountryCodes.US]:
    'you consent to receive recurring texts from Stand With Crypto. You can reply STOP to stop receiving texts. Message and data rates may apply.',
  [SupportedCountryCodes.GB]:
    'I authorize Stand With Crypto International Ltd and its service providers to contact me at this number via text (SMS) for cryptocurrency advocacy purposes. Message and data rates may apply. To opt-out at any time reply "STOP".',
  [SupportedCountryCodes.CA]:
    'I authorize Stand With Crypto International Ltd and its service providers to contact me at this number via text (SMS) for cryptocurrency advocacy purposes. Message and data rates may apply. To opt-out at any time reply "STOP".',
  [SupportedCountryCodes.AU]:
    'I authorize Stand With Crypto International Ltd and its service providers to contact me at this number via text (SMS) for cryptocurrency advocacy purposes. Message and data rates may apply. To opt-out at any time reply "STOP".',
}

export function SMSOptInConsentText({
  countryCode,
  consentButtonText,
}: {
  countryCode: SupportedCountryCodes
  consentButtonText?: string
}) {
  if (consentButtonText && !requiresOptInConfirmation(countryCode)) {
    return `By clicking ${consentButtonText}, ${SMS_OPT_IN_CONSENT[countryCode]}`
  }

  return `By checking this box, ${SMS_OPT_IN_CONSENT[countryCode]}`
}

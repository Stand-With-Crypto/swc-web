import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { fullUrl } from '@/utils/shared/urls'

interface SMSMessages {
  welcomeMessage: string
  goodbyeMessage: string
  unstopConfirmationMessage: string
  helpMessage: string
  bulkWelcomeMessage: string
}

const US_SMS_MESSAGES: SMSMessages = {
  welcomeMessage: `Thanks for subscribing to Stand With Crypto! You can expect news, opportunities to engage, and critical updates on crypto policy. Browse our resources and research where your elected officials stand on crypto at ${fullUrl('')}\n\nMessage & data rates may apply. Message frequency varies. Reply HELP for help or STOP to opt out.`,
  goodbyeMessage: `You have opted out and will no longer receive texts from Stand With Crypto. Text START to receive texts from SWC.`,
  unstopConfirmationMessage: `Thanks for subscribing to Stand With Crypto. Message & data rates may apply. Message frequency varies. Reply HELP for help or STOP to opt out.`,
  helpMessage: `Reply STOP to unsubscribe. Contact Stand With Crypto Support at info@StandWithCrypto.org`,
  bulkWelcomeMessage: `Thank you for being a Stand With Crypto advocate. Message & data rates may apply. Message frequency varies. Reply HELP for help or STOP to opt out.`,
}

const GB_SMS_MESSAGES: SMSMessages = {
  welcomeMessage: `Thanks for subscribing to Stand With Crypto! You can expect news, opportunities to engage, and critical updates on crypto policy. Browse our resources and research where your elected officials stand on crypto at ${fullUrl(`/${SupportedCountryCodes.GB}`)}\n\nMessage & data rates may apply. Message frequency varies. Reply HELP for help or STOP to opt out.`,
  goodbyeMessage: `You have opted out and will no longer receive texts from Stand With Crypto. Text START to receive texts from SWC.`,
  unstopConfirmationMessage: `Thanks for subscribing to Stand With Crypto. Message & data rates may apply. Message frequency varies. Reply HELP for help or STOP to opt out.`,
  helpMessage: `Reply STOP to unsubscribe. Contact Stand With Crypto Support at uk@swcinternational.org`,
  bulkWelcomeMessage: `Thank you for being a Stand With Crypto advocate. Message & data rates may apply. Message frequency varies. Reply HELP for help or STOP to opt out.`,
}

const CA_SMS_MESSAGES: SMSMessages = {
  welcomeMessage: `Thanks for subscribing to Stand With Crypto! You can expect news, opportunities to engage, and critical updates on crypto policy. Browse our resources and research where your elected officials stand on crypto at ${fullUrl(`/${SupportedCountryCodes.CA}`)}\n\nMessage & data rates may apply. Message frequency varies. Reply HELP for help or STOP to opt out.`,
  goodbyeMessage: `You have opted out and will no longer receive texts from Stand With Crypto. Text START to receive texts from SWC.`,
  unstopConfirmationMessage: `Thanks for subscribing to Stand With Crypto. Message & data rates may apply. Message frequency varies. Reply HELP for help or STOP to opt out.`,
  helpMessage: `Reply STOP to unsubscribe. Contact Stand With Crypto Support at ca@swcinternational.org`,
  bulkWelcomeMessage: `Thank you for being a Stand With Crypto advocate. Message & data rates may apply. Message frequency varies. Reply HELP for help or STOP to opt out.`,
}

const AU_SMS_MESSAGES: SMSMessages = {
  welcomeMessage: `Thanks for subscribing to Stand With Crypto! You can expect news, opportunities to engage, and critical updates on crypto policy. Browse our resources and research where your elected officials stand on crypto at ${fullUrl(`/${SupportedCountryCodes.AU}`)}\n\nMessage & data rates may apply. Message frequency varies. Reply HELP for help or STOP to opt out.`,
  goodbyeMessage: `You have opted out and will no longer receive texts from Stand With Crypto. Text START to receive texts from SWC.`,
  unstopConfirmationMessage: `Thanks for subscribing to Stand With Crypto. Message & data rates may apply. Message frequency varies. Reply HELP for help or STOP to opt out.`,
  helpMessage: `Reply STOP to unsubscribe. Contact Stand With Crypto Support at au@swcinternational.org`,
  bulkWelcomeMessage: `Thank you for being a Stand With Crypto advocate. Message & data rates may apply. Message frequency varies. Reply HELP for help or STOP to opt out.`,
}

const SMS_MESSAGES: Record<SupportedCountryCodes, SMSMessages> = {
  [SupportedCountryCodes.US]: US_SMS_MESSAGES,
  [SupportedCountryCodes.GB]: GB_SMS_MESSAGES,
  [SupportedCountryCodes.CA]: CA_SMS_MESSAGES,
  [SupportedCountryCodes.AU]: AU_SMS_MESSAGES,
}

export const getSMSMessages = (countryCode: SupportedCountryCodes) => {
  return SMS_MESSAGES[countryCode]
}

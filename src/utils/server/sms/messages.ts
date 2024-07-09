// This is just a placeholder, messages will be changed later.

const SWC_UNSTOP_SMS_KEYWORD = process.env.SWC_UNSTOP_SMS_KEYWORD

export const WELCOME_MESSAGE = `Thanks for subscribing to Stand With Crypto. Msg & data rates may apply. Message frequency varies. Reply HELP for help or STOP to opt out.`

export const GOODBYE_MESSAGE = `<goodbye message>. Reply HELP for help or ${SWC_UNSTOP_SMS_KEYWORD ?? 'CONTINUE'} to opt back in.`

export const UNSTOP_CONFIRMATION_MESSAGE = `<unstop confirmation message>. Reply HELP for help or STOP to opt out.`

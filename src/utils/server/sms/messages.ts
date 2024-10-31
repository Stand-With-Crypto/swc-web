import { fullUrl } from '@/utils/shared/urls'

export const WELCOME_MESSAGE = `Thanks for subscribing to Stand With Crypto! You can expect news, opportunities to engage, and critical updates on crypto policy. The most important thing you can do NOW is to learn where your politicians stand on crypto and get ready to vote at ${fullUrl('/w/vote/<%= sessionId %>')} \n\nMessage & data rates may apply. Message frequency varies. Reply HELP for help or STOP to opt out.`

export const GOODBYE_MESSAGE = `You have opted out and will no longer receive texts from Stand With Crypto. Text START to receive texts from SWC.`

export const UNSTOP_CONFIRMATION_MESSAGE = `Thanks for subscribing to Stand With Crypto. Message & data rates may apply. Message frequency varies. Reply HELP for help or STOP to opt out.`

export const HELP_MESSAGE = `Reply STOP to unsubscribe. Contact Stand With Crypto Support at info@StandWithCrypto.org`

// This message is appended to the end of bulk messages if the user has not yet received a welcome message.
export const BULK_WELCOME_MESSAGE = `Thank you for being a Stand With Crypto advocate. Message & data rates may apply. Message frequency varies. Reply HELP for help or STOP to opt out.`

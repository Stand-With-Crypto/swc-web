// List of common known bot user-agent substrings (email scanners, monitoring, etc)
export const KNOWN_BOT_USER_AGENTS = [
  'Amazon SES',
  'Barracuda',
  'DatadogSynthetics',
  'GoogleImageProxy',
  'Mailgun',
  'Mailinator',
  'Microsoft Office',
  'Outlook',
]

export function isKnownBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) {
    return false
  }
  return KNOWN_BOT_USER_AGENTS.some(botUA => userAgent.includes(botUA))
}

export function isKnownBotClient(): boolean {
  return typeof navigator !== 'undefined' && isKnownBotUserAgent(navigator.userAgent)
}

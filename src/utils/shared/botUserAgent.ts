// List of common known bot user-agent substrings (email scanners, monitoring, etc)
export const KNOWN_BOT_USER_AGENTS = [
  'Amazon SES',
  'Barracuda',
  'Cisco IronPort',
  'DatadogSynthetics',
  'ElasticEmail',
  'EmailCloud',
  'FireEye',
  'FortiMail',
  'GoogleImageProxy',
  'Kaspersky',
  'Mail.Ru',
  'Mailchimp',
  'Mailgun',
  'Mailinator',
  'Mailjet',
  'McAfee',
  'Microsoft Office',
  'Mimecast',
  'Outlook',
  'Postfix',
  'Proofpoint',
  'SendGrid',
  'SonicWALL',
  'Sophos',
  'SpamAssassin',
  'Symantec',
  'Thunderbird',
  'Trend Micro',
  'TrendMicro',
  'Zix',
  'ZeroFOX',
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

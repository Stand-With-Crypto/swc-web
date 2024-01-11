import { customLogger, logger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { AnalyticProperties } from '@/utils/shared/sharedAnalytics'
import mixpanel from 'mixpanel-browser'

const NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN = requiredEnv(
  process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN,
  'process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN',
)

export function initClientAnalytics() {
  mixpanel.init(NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN, {
    track_pageview: false,
    persistence: 'localStorage',
  })
}
export function identifyClientAnalyticsUser(sessionIdOrCryptoWalletAddress: string) {
  mixpanel.identify(sessionIdOrCryptoWalletAddress)
}

export function trackClientAnalytic(eventName: string, eventProperties: AnalyticProperties) {
  customLogger(
    {
      category: 'analytics',
      formattedMessage: `%canalytics - %c ${eventName}`,
      originalMessage: eventName,
    },
    ['color: #00aaff', 'color: #FCFDFB'],
    eventProperties,
  )
  mixpanel.track(eventName, {
    eventProperties,
  })
}

export function trackFormSubmitted(formName: string, other?: AnalyticProperties) {
  trackClientAnalytic('Form Submitted', { 'Form Name': formName, ...other })
}

export function trackFormSubmitSucceeded(formName: string, other?: AnalyticProperties) {
  trackClientAnalytic('Form Submit Succeeded', { 'Form Name': formName, ...other })
}

export function trackFormSubmitErrored(formName: string, other?: AnalyticProperties) {
  trackClientAnalytic('Form Submit Errored', { 'Form Name': formName, ...other })
}

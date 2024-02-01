import { customLogger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { AnalyticProperties } from '@/utils/shared/sharedAnalytics'
import mixpanel from 'mixpanel-browser'
import { track as vercelTrack } from '@vercel/analytics'
import { formatVercelAnalyticsEventProperties } from '@/utils/shared/vercelAnalytics'
import { isCypress, isStorybook } from '@/utils/shared/executionEnvironment'

const NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN = requiredEnv(
  process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN,
  'process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN',
)

const environmentHasAnalyticsEnabled = !isStorybook && !isCypress

export function initClientAnalytics() {
  mixpanel.init(NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN, {
    track_pageview: false,
    persistence: 'localStorage',
  })
}
export function identifyClientAnalyticsUser(userId: string) {
  if (environmentHasAnalyticsEnabled) {
    mixpanel.identify(userId)
  }
}

export function trackClientAnalytic(eventName: string, eventProperties?: AnalyticProperties) {
  customLogger(
    {
      category: 'analytics',
      formattedMessage: `%canalytics - %c ${eventName}`,
      originalMessage: eventName,
    },
    ['color: #00aaff', 'color: #FCFDFB'],
    eventProperties,
  )
  if (environmentHasAnalyticsEnabled) {
    mixpanel.track(eventName, {
      eventProperties,
    })
    vercelTrack(eventName, eventProperties && formatVercelAnalyticsEventProperties(eventProperties))
  }
}

export function setClientAnalyticsUserProperties(userProperties: object) {
  if (environmentHasAnalyticsEnabled) {
    mixpanel.people.set(userProperties)
  }
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

export function trackExternalLink(eventProperties?: AnalyticProperties) {
  trackClientAnalytic('External Link clicked', { ...eventProperties })
}

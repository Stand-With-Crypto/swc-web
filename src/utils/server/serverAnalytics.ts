import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { track as vercelTrack } from '@vercel/analytics/server'
import mixpanelLib, { PropertyDict } from 'mixpanel'

import {
  LocalUser,
  mapCurrentSessionLocalUserToAnalyticsProperties,
} from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { AnalyticProperties, AnalyticsPeopleProperties } from '@/utils/shared/sharedAnalytics'
import { sleep } from '@/utils/shared/sleep'
import { formatVercelAnalyticsEventProperties } from '@/utils/shared/vercelAnalytics'

const NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN = requiredEnv(
  process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN,
  'process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN',
)

const mixpanel = mixpanelLib.init(NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN)

const logger = getLogger('serverAnalytics')

type ServerAnalyticsConfig = { localUser: LocalUser | null; userId: string }

// Can't use nodejs `promisify`, the type definitions broke when used with `mixpanel.track`
const promisifiedMixpanelTrack = (eventName: string, properties: PropertyDict) =>
  new Promise<void>((resolve, reject) => {
    mixpanel.track(eventName, properties, err => (err ? reject(err) : resolve()))
  })

const TIMEOUT_STATUS_CODE = 'timeout' as const
async function trackAnalytic(
  _config: ServerAnalyticsConfig,
  eventName: string,
  eventProperties?: AnalyticProperties,
) {
  let config = _config
  // a local user will not exist if the user has disabled tracking
  if (!config.localUser) {
    logger.info(`Anonymizing Event: "${eventName}"`, eventProperties)
    config = {
      userId: 'ANONYMOUS_USER_TRACKING_ID',
      localUser: {
        currentSession: {
          datetimeOnLoad: new Date().toISOString(),
          searchParamsOnLoad: {},
        },
      },
    }
  }

  logger.info(`Event Name: "${eventName}"`, eventProperties)
  await Promise.any([
    sleep(1500).then(() => TIMEOUT_STATUS_CODE),
    Promise.all([
      process.env.VERCEL_URL &&
        vercelTrack(
          eventName,
          eventProperties && formatVercelAnalyticsEventProperties(eventProperties),
        ),
      promisifiedMixpanelTrack(eventName, {
        ...eventProperties,
        distinct_id: config.userId,
      }),
    ]),
  ])
    .then(res => {
      if (res === TIMEOUT_STATUS_CODE) {
        throw new Error('Request timeout')
      }
    })
    .catch(err =>
      Sentry.captureException(err, {
        tags: { domain: 'trackAnalytic' },
        extra: { eventName, eventProperties, isTrackingInVercel: !!process.env.VERCEL_URL },
      }),
    )
}

type CreationMethod = 'On Site' | 'Verified SWC Partner'
export type AnalyticsUserActionUserState = 'New' | 'Existing' | 'Existing With Updates'

export function getServerAnalytics(config: ServerAnalyticsConfig) {
  const currentSessionAnalytics =
    config.localUser?.currentSession &&
    mapCurrentSessionLocalUserToAnalyticsProperties(config.localUser.currentSession)
  const trackUserActionCreated = async ({
    actionType,
    campaignName,
    creationMethod = 'On Site',
    userState,
    ...other
  }: {
    actionType: UserActionType
    creationMethod?: CreationMethod
    campaignName: string
    userState: AnalyticsUserActionUserState
  } & AnalyticProperties) =>
    trackAnalytic(config, 'User Action Created', {
      ...currentSessionAnalytics,
      'User Action Type': actionType,
      'Campaign Name': campaignName,
      'Creation Method': creationMethod,
      'User State': userState,
      ...other,
    })

  const trackUserActionCreatedIgnored = async ({
    actionType,
    campaignName,
    reason,
    creationMethod = 'On Site',
    userState,
    ...other
  }: {
    actionType: UserActionType
    campaignName: string
    creationMethod?: CreationMethod
    reason: 'Too Many Recent' | 'Already Exists'
    userState: AnalyticsUserActionUserState
  } & AnalyticProperties) =>
    trackAnalytic(config, ' Type Creation Ignored', {
      ...currentSessionAnalytics,
      'User Action Type': actionType,
      'Campaign Name': campaignName,
      'Creation Method': creationMethod,
      'User State': userState,
      Reason: reason,
      ...other,
    })

  const track = async (
    eventName: string,
    {
      creationMethod = 'On Site',
      ...eventProperties
    }: AnalyticProperties & { creationMethod?: CreationMethod } = {},
  ) =>
    trackAnalytic(config, eventName, {
      'Creation Method': creationMethod,
      ...currentSessionAnalytics,
      ...eventProperties,
    })

  return { trackUserActionCreated, trackUserActionCreatedIgnored, track }
}

export function getServerPeopleAnalytics(config: ServerAnalyticsConfig) {
  function setOnce(peopleProperties: AnalyticsPeopleProperties) {
    if (!config.localUser) {
      logger.info(`Skipped People Properties Set Once`, peopleProperties)
      return
    }

    logger.info(`People Properties Set Once`, peopleProperties)
    // we could wrap this in a promise and await it, but we don't want to block the request
    mixpanel.people.set_once(config.userId, peopleProperties, err => {
      if (err) {
        Sentry.captureException(err, { tags: { domain: 'trackPeopleAnalyticOnce' } })
      }
    })
  }

  function set(peopleProperties: AnalyticsPeopleProperties) {
    if (!config.localUser) {
      logger.info(`Skipped People Properties Set`, peopleProperties)
      return
    }
    logger.info(`People Properties Set`, peopleProperties)
    // we could wrap this in a promise and await it, but we don't want to block the request
    mixpanel.people.set(config.userId, peopleProperties, err => {
      if (err) {
        Sentry.captureException(err, { tags: { domain: 'trackPeopleAnalytic' } })
      }
    })
  }

  return { setOnce, set }
}

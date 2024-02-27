import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { track as vercelTrack } from '@vercel/analytics/server'
import mixpanelLib, { PropertyDict } from 'mixpanel'
import { promisify } from 'util'

import {
  LocalUser,
  mapCurrentSessionLocalUserToAnalyticsProperties,
} from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { resolveWithTimeout } from '@/utils/shared/resolveWithTimeout'
import { AnalyticProperties, AnalyticsPeopleProperties } from '@/utils/shared/sharedAnalytics'
import { formatVercelAnalyticsEventProperties } from '@/utils/shared/vercelAnalytics'

const NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN = requiredEnv(
  process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN,
  'process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN',
)

const mixpanel = mixpanelLib.init(NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN)

const logger = getLogger('serverAnalytics')

type ServerAnalyticsConfig = { localUser: LocalUser | null; userId: string }

const promisifiedMixpanelTrack = promisify<string, PropertyDict, void>(mixpanel.track)
const promisifiedMixpanelPeopleSet = promisify<string, PropertyDict, void>(mixpanel.people.set)
const promisifiedMixpanelPeopleSetOnce = promisify<string, PropertyDict, void>(
  mixpanel.people.set_once,
)

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
  await resolveWithTimeout(
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
  ).catch(err =>
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
  async function setOnce(peopleProperties: AnalyticsPeopleProperties) {
    if (!config.localUser) {
      logger.info(`Skipped People Properties Set Once`, peopleProperties)
      return
    }

    logger.info(`People Properties Set Once`, peopleProperties)

    await resolveWithTimeout(
      promisifiedMixpanelPeopleSetOnce(config.userId, peopleProperties),
    ).catch(err =>
      Sentry.captureException(err, {
        tags: { domain: 'trackPeopleAnalyticOnce' },
        user: { id: config.userId },
      }),
    )
  }

  async function set(peopleProperties: AnalyticsPeopleProperties) {
    if (!config.localUser) {
      logger.info(`Skipped People Properties Set`, peopleProperties)
      return
    }
    logger.info(`People Properties Set`, peopleProperties)
    await resolveWithTimeout(promisifiedMixpanelPeopleSet(config.userId, peopleProperties)).catch(
      err =>
        Sentry.captureException(err, {
          tags: { domain: 'trackPeopleAnalytic' },
          user: { id: config.userId },
        }),
    )
  }

  return { setOnce, set }
}

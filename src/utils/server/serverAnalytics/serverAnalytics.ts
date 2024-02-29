import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { track as vercelTrack } from '@vercel/analytics/server'
import { PropertyDict } from 'mixpanel'
import { promisify } from 'util'

import {
  LocalUser,
  mapCurrentSessionLocalUserToAnalyticsProperties,
} from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { resolveWithTimeout } from '@/utils/shared/resolveWithTimeout'
import { AnalyticProperties } from '@/utils/shared/sharedAnalytics'
import { formatVercelAnalyticsEventProperties } from '@/utils/shared/vercelAnalytics'

import { ANALYTICS_FLUSH_TIMEOUT_MS, mixpanel } from './shared'

const logger = getLogger('serverAnalytics')

type ServerAnalyticsConfig = { localUser: LocalUser | null; userId: string }

const promisifiedMixpanelTrack = promisify<string, PropertyDict, void>(mixpanel.track)

type CreationMethod = 'On Site' | 'Verified SWC Partner'
export type AnalyticsUserActionUserState = 'New' | 'Existing' | 'Existing With Updates'
export type ServerAnalytics = ReturnType<typeof getServerAnalytics>

/**
 * @remarks — Remember to always call and wait `flush()` at the end of the scope
 */
export function getServerAnalytics(config: ServerAnalyticsConfig) {
  const trackingRequests: Promise<void>[] = []
  const currentSessionAnalytics =
    config.localUser?.currentSession &&
    mapCurrentSessionLocalUserToAnalyticsProperties(config.localUser.currentSession)

  const flush = async () => {
    return resolveWithTimeout(Promise.all(trackingRequests), ANALYTICS_FLUSH_TIMEOUT_MS)
  }

  const onError =
    ({ eventName, eventProperties }: { eventName: string; eventProperties?: AnalyticProperties }) =>
    // Any is the typing of `Sentry.captureException`
    (err: any) => {
      Sentry.captureException(err, {
        tags: { domain: 'trackAnalytic' },
        extra: { eventName, eventProperties, isTrackingInVercel: !!process.env.VERCEL_URL },
        fingerprint: err?.message?.includes('Request timeout')
          ? [`trackAnalyticResolveWithTimeout`]
          : undefined,
      })
    }

  const trackAnalytic = (
    _config: ServerAnalyticsConfig,
    eventName: string,
    eventProperties?: AnalyticProperties,
  ) => {
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

    trackingRequests.push(
      promisifiedMixpanelTrack(eventName, {
        ...eventProperties,
        distinct_id: config.userId,
      }).catch(onError({ eventName, eventProperties })),
    )

    if (process.env.VERCEL_URL) {
      trackingRequests.push(
        vercelTrack(
          eventName,
          eventProperties && formatVercelAnalyticsEventProperties(eventProperties),
        ).catch(onError({ eventName, eventProperties })),
      )
    }

    return { flush }
  }

  const trackUserActionCreated = ({
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
  } & AnalyticProperties) => {
    return trackAnalytic(config, 'User Action Created', {
      ...currentSessionAnalytics,
      'User Action Type': actionType,
      'Campaign Name': campaignName,
      'Creation Method': creationMethod,
      'User State': userState,
      ...other,
    })
  }

  const trackUserActionCreatedIgnored = ({
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
  } & AnalyticProperties) => {
    return trackAnalytic(config, ' Type Creation Ignored', {
      ...currentSessionAnalytics,
      'User Action Type': actionType,
      'Campaign Name': campaignName,
      'Creation Method': creationMethod,
      'User State': userState,
      Reason: reason,
      ...other,
    })
  }

  const track = (
    eventName: string,
    {
      creationMethod = 'On Site',
      ...eventProperties
    }: AnalyticProperties & { creationMethod?: CreationMethod } = {},
  ) => {
    return trackAnalytic(config, eventName, {
      'Creation Method': creationMethod,
      ...currentSessionAnalytics,
      ...eventProperties,
    })
  }

  return { trackUserActionCreated, trackUserActionCreatedIgnored, track, flush }
}

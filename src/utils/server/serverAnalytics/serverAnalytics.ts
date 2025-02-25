import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { PropertyDict } from 'mixpanel'
import { promisify } from 'util'

import { getTenantId } from '@/utils/server/getTenantId'
import {
  LocalUser,
  mapCurrentSessionLocalUserToAnalyticsProperties,
  mapPersistedLocalUserToExperimentAnalyticsProperties,
} from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { resolveWithTimeout } from '@/utils/shared/resolveWithTimeout'
import { AnalyticProperties } from '@/utils/shared/sharedAnalytics'

import { ANALYTICS_FLUSH_TIMEOUT_MS, mixpanel } from './shared'

const logger = getLogger('serverAnalytics')

type ServerAnalyticsConfig = { localUser: LocalUser | null; userId: string }

const promisifiedMixpanelTrack = promisify<string, PropertyDict, void>(mixpanel.track)

type CreationMethod = 'On Site' | 'Verified SWC Partner' | 'Third Party'
export type AnalyticsUserActionUserState = 'New' | 'Existing' | 'Existing With Updates'
export type ServerAnalytics = ReturnType<typeof getServerAnalytics>

/**
 * @remarks — Remember to always call and wait `flush()` at the end of the scope
 */
export function getServerAnalytics(config: ServerAnalyticsConfig) {
  const trackingRequests: Promise<void>[] = []
  const currentSessionAnalytics = {
    ...(config.localUser?.currentSession &&
      mapCurrentSessionLocalUserToAnalyticsProperties(config.localUser.currentSession)),
    ...mapPersistedLocalUserToExperimentAnalyticsProperties(config.localUser?.persisted),
  }

  const flush = async () => {
    return resolveWithTimeout(Promise.all(trackingRequests), ANALYTICS_FLUSH_TIMEOUT_MS).catch(
      err => {
        Sentry.captureException(err, {
          tags: { domain: 'trackAnalytic' },
          fingerprint: err?.message?.includes('Request timeout')
            ? [`trackAnalyticFlushWithTimeout`]
            : undefined,
        })
      },
    )
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
    _eventProperties?: AnalyticProperties,
  ) => {
    const eventProperties = { ...currentSessionAnalytics, ..._eventProperties }
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

    const getCountryCodeAndTrack = async () => {
      const countryCode = await getTenantId()

      await promisifiedMixpanelTrack(eventName, {
        ...eventProperties,
        distinct_id: config.userId,
        countryCode,
      })
    }

    trackingRequests.push(getCountryCodeAndTrack().catch(onError({ eventName, eventProperties })))

    return { flush }
  }

  const trackUserActionUpdated = ({
    actionType,
    campaignName,
    userState,
    ...other
  }: {
    actionType: UserActionType
    campaignName: string
    userState: AnalyticsUserActionUserState
  } & AnalyticProperties) => {
    return trackAnalytic(config, 'User Action Updated', {
      'User Action Type': actionType,
      'Campaign Name': campaignName,
      'User State': userState,
      ...other,
    })
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
    return trackAnalytic(
      config,
      // typo'ed this initially, do not change so we retain historical trend data
      ' Type Creation Ignored',
      {
        'User Action Type': actionType,
        'Campaign Name': campaignName,
        'Creation Method': creationMethod,
        'User State': userState,
        Reason: reason,
        ...other,
      },
    )
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
      ...eventProperties,
    })
  }

  return {
    trackUserActionCreated,
    trackUserActionUpdated,
    trackUserActionCreatedIgnored,
    track,
    flush,
  }
}

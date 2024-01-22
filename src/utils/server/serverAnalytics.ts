import { getLogger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { AnalyticProperties, AnalyticsPeopleProperties } from '@/utils/shared/sharedAnalytics'
import { UserActionType, UserCryptoAddress } from '@prisma/client'
import mixpanelLib from 'mixpanel'
import * as Sentry from '@sentry/nextjs'
import { track as vercelTrack } from '@vercel/analytics/server'
import {
  LocalUser,
  mapCurrentSessionLocalUserToAnalyticsProperties,
} from '@/utils/shared/localUser'
import { formatVercelAnalyticsEventProperties } from '@/utils/shared/vercelAnalytics'

const NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN = requiredEnv(
  process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN,
  'process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN',
)

const mixpanel = mixpanelLib.init(NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN)

const logger = getLogger('serverAnalytics')

type ServerAnalyticsConfig = { localUser: LocalUser | null } & (
  | { userCryptoAddress: UserCryptoAddress }
  | { address: string }
  | {
      sessionId: string
    }
)

const getDistinctId = (clientIdentifier: ServerAnalyticsConfig) => {
  if ('sessionId' in clientIdentifier) {
    return clientIdentifier.sessionId
  }
  if ('userCryptoAddress' in clientIdentifier) {
    return clientIdentifier.userCryptoAddress.cryptoAddress
  }
  return clientIdentifier.address
}

function trackAnalytic(
  config: ServerAnalyticsConfig,
  eventName: string,
  eventProperties?: AnalyticProperties,
) {
  // a local user will not exist if the user has disabled tracking
  if (!config.localUser) {
    logger.info(`Skipped Event Name: "${eventName}"`, eventProperties)
    return
  }
  logger.info(`Event Name: "${eventName}"`, eventProperties)
  vercelTrack(eventName, eventProperties && formatVercelAnalyticsEventProperties(eventProperties))
  // we could wrap this in a promise and await it, but we don't want to block the request
  mixpanel.track(
    eventName,
    {
      ...eventProperties,
      distinct_id: getDistinctId(config),
    },
    err => {
      if (err) {
        Sentry.captureException(err, { tags: { domain: 'trackAnalytic' } })
      }
    },
  )
}

type CreationMethod = 'On Site' | 'Verified SWC Partner'
// TODO determine if we need to be awaiting this
export function getServerAnalytics(config: ServerAnalyticsConfig) {
  const currentSessionAnalytics =
    config.localUser?.currentSession &&
    mapCurrentSessionLocalUserToAnalyticsProperties(config.localUser.currentSession)
  function trackUserActionCreated({
    actionType,
    campaignName,
    creationMethod = 'On Site',
    userState,
    ...other
  }: {
    actionType: UserActionType
    creationMethod?: CreationMethod
    campaignName: string
    userState: 'New' | 'Existing' | 'Existing With Updates'
  } & AnalyticProperties) {
    trackAnalytic(config, 'User Action Created', {
      ...currentSessionAnalytics,
      'User Action Type': actionType,
      'Campaign Name': campaignName,
      'Creation Method': creationMethod,
      'User State': userState,
      ...other,
    })
  }
  function trackUserActionCreatedIgnored({
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
    userState: 'New' | 'Existing' | 'Existing With Updates'
  } & AnalyticProperties) {
    trackAnalytic(config, ' Type Creation Ignored', {
      ...currentSessionAnalytics,
      'User Action Type': actionType,
      'Campaign Name': campaignName,
      'Creation Method': creationMethod,
      'User State': userState,
      Reason: reason,
      ...other,
    })
  }

  function track(
    eventName: string,
    {
      creationMethod = 'On Site',
      ...eventProperties
    }: AnalyticProperties & { creationMethod?: CreationMethod } = {},
  ) {
    trackAnalytic(config, eventName, {
      'Creation Method': creationMethod,
      ...currentSessionAnalytics,
      ...eventProperties,
    })
  }

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
    mixpanel.people.set_once(getDistinctId(config), peopleProperties, err => {
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
    mixpanel.people.set(getDistinctId(config), peopleProperties, err => {
      if (err) {
        Sentry.captureException(err, { tags: { domain: 'trackPeopleAnalytic' } })
      }
    })
  }

  return { setOnce, set }
}

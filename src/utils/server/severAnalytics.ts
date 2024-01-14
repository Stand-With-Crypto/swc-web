import { customLogger, getLogger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { AnalyticProperties, AnalyticsPeopleProperties } from '@/utils/shared/sharedAnalytics'
import { UserActionType, UserCryptoAddress } from '@prisma/client'
import mixpanelLib from 'mixpanel'
import * as Sentry from '@sentry/nextjs'
import {
  LocalUser,
  mapCurrentSessionLocalUserToAnalyticsProperties,
} from '@/utils/shared/localUser'

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
    return clientIdentifier.userCryptoAddress.address
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
  // we could wrap this in a promise and await it, but we don't want to block the request
  mixpanel.track(
    eventName,
    {
      ...eventProperties,
      distinct_id: getDistinctId(config),
    },
    err => {
      Sentry.captureException(err, { tags: { domain: 'trackAnalytic' } })
    },
  )
}
// TODO determine if we need to be awaiting this
export function getServerAnalytics(config: ServerAnalyticsConfig) {
  const currentSessionAnalytics =
    config.localUser?.currentSession &&
    mapCurrentSessionLocalUserToAnalyticsProperties(config.localUser.currentSession)
  function trackUserActionCreated({
    actionType,
    campaignName,
    ...other
  }: {
    actionType: UserActionType
    campaignName: string
  } & AnalyticProperties) {
    trackAnalytic(config, 'User Action Created', {
      ...currentSessionAnalytics,
      'User Action Type': actionType,
      'Campaign Name': campaignName,
      ...other,
    })
  }
  function trackUserActionCreatedIgnored({
    actionType,
    campaignName,
    reason,
    ...other
  }: {
    actionType: UserActionType
    campaignName: string
    reason: 'Too Many Recent'
  } & AnalyticProperties) {
    trackAnalytic(config, ' Type Creation Ignored', {
      ...currentSessionAnalytics,
      'User Action Type': actionType,
      'Campaign Name': campaignName,
      Reason: reason,
      ...other,
    })
  }

  function track(eventName: string, eventProperties?: AnalyticProperties) {
    trackAnalytic(config, eventName, { ...currentSessionAnalytics, ...eventProperties })
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
      Sentry.captureException(err, { tags: { domain: 'trackPeopleAnalyticOnce' } })
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
      Sentry.captureException(err, { tags: { domain: 'trackPeopleAnalytic' } })
    })
  }

  return { setOnce, set }
}

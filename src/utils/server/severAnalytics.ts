import { customLogger, getLogger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { AnalyticProperties } from '@/utils/shared/sharedAnalytics'
import { UserActionType, UserCryptoAddress } from '@prisma/client'
import mixpanelLib from 'mixpanel'

const NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN = requiredEnv(
  process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN,
  'process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN',
)

const mixpanel = mixpanelLib.init(NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN)

const logger = getLogger('serverAnalytics')

type ServerAnalyticsClientIdentifier =
  | { userCryptoAddress: UserCryptoAddress }
  | { address: string }
  | {
      sessionId: string
    }

function trackAnalytic(
  clientIdentifier: ServerAnalyticsClientIdentifier,
  eventName: string,
  eventProperties?: AnalyticProperties,
) {
  logger.info(`Event Name: "${eventName}"`, eventProperties)
  const distinctId =
    'sessionId' in clientIdentifier
      ? clientIdentifier.sessionId
      : 'userCryptoAddress' in clientIdentifier
        ? clientIdentifier.userCryptoAddress.address
        : clientIdentifier.address
  mixpanel.track(eventName, {
    ...eventProperties,
    distinct_id: distinctId,
  })
}
// TODO determine if we need to be awaiting this
export function getServerAnalytics(config: ServerAnalyticsClientIdentifier) {
  function trackUserActionCreated({
    actionType,
    campaignName,
    ...other
  }: {
    actionType: UserActionType
    campaignName: string
  } & AnalyticProperties) {
    return trackAnalytic(config, 'User Action Created', {
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
    return trackAnalytic(config, ' Type Creation Ignored', {
      'User Action Type': actionType,
      'Campaign Name': campaignName,
      Reason: reason,
      ...other,
    })
  }

  function track(eventName: string, eventProperties?: AnalyticProperties) {
    return trackAnalytic(config, eventName, eventProperties)
  }

  return { trackUserActionCreated, trackUserActionCreatedIgnored, track }
}

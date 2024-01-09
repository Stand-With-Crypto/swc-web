import { customLogger, getLogger } from '@/utils/shared/logger'
import { AnalyticProperties } from '@/utils/shared/sharedAnalytics'
import { UserActionType, UserCryptoAddress } from '@prisma/client'

const logger = getLogger('serverAnalytics')

type ServerAnalyticsClientIdentifier =
  | { userCryptoAddress: UserCryptoAddress }
  | {
      sessionId: string
    }

function trackAnalytic(
  clientIdentifier: ServerAnalyticsClientIdentifier,
  eventName: string,
  eventProperties: AnalyticProperties,
) {
  logger.info(`Event Name: "${eventName}}"`, eventProperties)
  // TODO replace with actual analytics solution
}

export function getServerAnalytics(config: ServerAnalyticsClientIdentifier) {
  function trackUserActionCreated({
    actionType,
    campaignName,
    ...other
  }: {
    actionType: UserActionType
    campaignName: string
  } & AnalyticProperties) {
    trackAnalytic(config, 'User Action Created', {
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
      'User Action Type': actionType,
      'Campaign Name': campaignName,
      Reason: reason,
      ...other,
    })
  }

  return { trackUserActionCreated, trackUserActionCreatedIgnored }
}

import { UserActionType } from '@prisma/client'

import { SupportedLocale } from '@/intl/locales'
import { ActiveClientUserActionType } from '@/utils/shared/activeUserAction'
import { getIntlPrefix } from '@/utils/shared/urls'
import {
  USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  UserActionCampaigns,
  UserActionEmailCampaignName,
} from '@/utils/shared/userActionCampaigns'

const parseQueryString = (queryString?: string) => {
  if (!queryString) return ''
  if (queryString.startsWith('?')) return queryString
  return `?${queryString}`
}

export type DeeplinkConfig = {
  locale: SupportedLocale
  queryString?: string
}

type DeeplinkFunction = (config: DeeplinkConfig) => string

export const USER_ACTION_DEEPLINK_MAP: Omit<
  {
    [key in ActiveClientUserActionType]: {
      getDeeplinkUrl: (config: { locale: SupportedLocale; queryString?: string }) => string
    }
  },
  typeof UserActionType.TWEET
> = {
  [UserActionType.OPT_IN]: {
    getDeeplinkUrl: ({ locale, queryString }) => {
      return `${getIntlPrefix(locale)}/action/sign-up${parseQueryString(queryString)}`
    },
  },
  [UserActionType.CALL]: {
    getDeeplinkUrl: ({ locale }) => {
      return `${getIntlPrefix(locale)}/action/call`
    },
  },
  [UserActionType.EMAIL]: {
    getDeeplinkUrl: ({ locale }) => {
      return `${getIntlPrefix(locale)}/action/email`
    },
  },
  [UserActionType.DONATION]: {
    getDeeplinkUrl: ({ locale }) => {
      return `${getIntlPrefix(locale)}/donate`
    },
  },
  [UserActionType.NFT_MINT]: {
    getDeeplinkUrl: ({ locale }) => {
      return `${getIntlPrefix(locale)}/action/nft-mint`
    },
  },
  [UserActionType.VOTER_REGISTRATION]: {
    getDeeplinkUrl: ({ locale }) => {
      return `${getIntlPrefix(locale)}/action/voter-registration`
    },
  },
}
export type UserActionTypesWithDeeplink = keyof typeof USER_ACTION_DEEPLINK_MAP

export const USER_ACTION_WITH_CAMPAIGN_DEEPLINK_MAP: {
  [key in ActiveClientUserActionType]?: {
    [campaign in UserActionCampaigns[key]]?: DeeplinkFunction
  }
} = {
  [UserActionType.EMAIL]: {
    [UserActionEmailCampaignName.CNN_PRESIDENTIAL_DEBATE_2024]: ({ locale }) => {
      return `${getIntlPrefix(locale)}/action/email-cnn`
    },
  },
}

export type UserActionWithCampaignDeeplink =
  (typeof USER_ACTION_WITH_CAMPAIGN_DEEPLINK_MAP)[UserActionTypesWithDeeplink]

type GetUserActionDeeplinkArgs<ActionType extends UserActionTypesWithDeeplink> = {
  actionType: ActionType
  config: DeeplinkConfig
  campaign?: UserActionCampaigns[ActionType]
}

export const getUserActionDeeplink = <
  ActionType extends UserActionTypesWithDeeplink = UserActionTypesWithDeeplink,
>({
  actionType,
  config,
  campaign,
}: GetUserActionDeeplinkArgs<ActionType>) => {
  if (!campaign || campaign === USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[actionType]) {
    return USER_ACTION_DEEPLINK_MAP[actionType].getDeeplinkUrl(config)
  }

  if (USER_ACTION_WITH_CAMPAIGN_DEEPLINK_MAP[actionType]?.[campaign]) {
    return USER_ACTION_WITH_CAMPAIGN_DEEPLINK_MAP[actionType]?.[campaign]?.(config)
  }

  throw new Error(`No deeplink found for actionType: ${actionType} and campaign: ${campaign}`)
}

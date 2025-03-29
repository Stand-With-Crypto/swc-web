import { UserActionType } from '@prisma/client'

import { ActiveClientUserActionType } from '@/utils/shared/activeUserActions'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlPrefix } from '@/utils/shared/urls'
import { ActiveClientUserActionWithCampaignType } from '@/utils/shared/userActionCampaigns'
import {
  COUNTRY_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  isActionSupportedForCountry,
  UserActionCampaignNames,
} from '@/utils/shared/userActionCampaigns/index'
import {
  USUserActionEmailCampaignName,
  USUserActionPollCampaignName,
} from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

const parseQueryString = (queryString?: string) => {
  if (!queryString) return ''
  if (queryString.startsWith('?')) return queryString
  return `?${queryString}`
}

type DeeplinkConfig = {
  countryCode: SupportedCountryCodes
  queryString?: string
}

type DeeplinkFunction = (config: DeeplinkConfig) => string

export const USER_ACTION_DEEPLINK_MAP: {
  [key in ActiveClientUserActionType]: {
    getDeeplinkUrl: (config: { countryCode: SupportedCountryCodes; queryString?: string }) => string
  }
} = {
  [UserActionType.OPT_IN]: {
    getDeeplinkUrl: ({ countryCode, queryString }) => {
      return `${getIntlPrefix(countryCode)}/action/sign-up${parseQueryString(queryString)}`
    },
  },
  [UserActionType.CALL]: {
    getDeeplinkUrl: ({ countryCode }) => {
      return `${getIntlPrefix(countryCode)}/action/call`
    },
  },
  [UserActionType.EMAIL]: {
    getDeeplinkUrl: ({ countryCode }) => {
      return `${getIntlPrefix(countryCode)}/action/email`
    },
  },
  [UserActionType.DONATION]: {
    getDeeplinkUrl: ({ countryCode }) => {
      return `${getIntlPrefix(countryCode)}/donate`
    },
  },
  [UserActionType.NFT_MINT]: {
    getDeeplinkUrl: ({ countryCode }) => {
      return `${getIntlPrefix(countryCode)}/action/nft-mint`
    },
  },
  [UserActionType.VOTER_REGISTRATION]: {
    getDeeplinkUrl: ({ countryCode }) => {
      return `${getIntlPrefix(countryCode)}/action/voter-registration`
    },
  },
  [UserActionType.TWEET]: {
    getDeeplinkUrl: ({ countryCode }) => {
      return `${getIntlPrefix(countryCode)}/action/share`
    },
  },
  [UserActionType.VOTER_ATTESTATION]: {
    getDeeplinkUrl: ({ countryCode }) => {
      return `${getIntlPrefix(countryCode)}/action/pledge`
    },
  },
  [UserActionType.VOTING_INFORMATION_RESEARCHED]: {
    getDeeplinkUrl: ({ countryCode }) => {
      return `${getIntlPrefix(countryCode)}/action/voting-information`
    },
  },
  [UserActionType.VOTING_DAY]: {
    getDeeplinkUrl: ({ countryCode }) => {
      return `${getIntlPrefix(countryCode)}/action/voting-day`
    },
  },
  [UserActionType.REFER]: {
    getDeeplinkUrl: ({ countryCode }) => {
      return `${getIntlPrefix(countryCode)}/action/refer`
    },
  },
  [UserActionType.POLL]: {
    getDeeplinkUrl: ({ countryCode }) => {
      return `${getIntlPrefix(countryCode)}/action/poll`
    },
  },
}
export type UserActionTypesWithDeeplink = keyof typeof USER_ACTION_DEEPLINK_MAP

const USER_ACTION_WITH_CAMPAIGN_DEEPLINK_MAP: {
  [actionType in ActiveClientUserActionWithCampaignType]?: {
    [campaign in UserActionCampaignNames]?: DeeplinkFunction
  }
} = {
  [UserActionType.EMAIL]: {
    [USUserActionEmailCampaignName.ABC_PRESIDENTIAL_DEBATE_2024]: ({ countryCode }) => {
      return `${getIntlPrefix(countryCode)}/action/email-debate`
    },
    [USUserActionEmailCampaignName.BROKER_REPORTING_RULE_SJ_RES_3_MARCH_10TH]: ({
      countryCode,
    }) => {
      return `${getIntlPrefix(countryCode)}/action/email`
    },
  },
  [UserActionType.POLL]: {
    [USUserActionPollCampaignName.CRYPTO_NEWS]: ({ countryCode }) => {
      return `${getIntlPrefix(countryCode)}/action/poll`
    },
    [USUserActionPollCampaignName.DIGITAL_ASSETS]: ({ countryCode }) => {
      return `${getIntlPrefix(countryCode)}/action/poll`
    },
    [USUserActionPollCampaignName.ENCOURAGE]: ({ countryCode }) => {
      return `${getIntlPrefix(countryCode)}/action/poll`
    },
    [USUserActionPollCampaignName.OVAL_OFFICE]: ({ countryCode }) => {
      return `${getIntlPrefix(countryCode)}/action/poll`
    },
  },
}

type GetUserActionDeeplinkArgs<ActionType extends UserActionTypesWithDeeplink> = {
  actionType: ActionType
  config: DeeplinkConfig
  campaign?: UserActionCampaignNames
}

export const getUserActionDeeplink = <
  ActionType extends UserActionTypesWithDeeplink = UserActionTypesWithDeeplink,
>({
  actionType,
  config,
  campaign,
}: GetUserActionDeeplinkArgs<ActionType>) => {
  const isDefaultCampaign =
    isActionSupportedForCountry(config.countryCode, actionType) &&
    campaign === COUNTRY_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[config.countryCode][actionType]

  if (!campaign || isDefaultCampaign) {
    return USER_ACTION_DEEPLINK_MAP[actionType].getDeeplinkUrl(config)
  }

  if (USER_ACTION_WITH_CAMPAIGN_DEEPLINK_MAP[actionType]?.[campaign]) {
    return USER_ACTION_WITH_CAMPAIGN_DEEPLINK_MAP[actionType]?.[campaign]?.(config)
  }

  throw new Error(`No deeplink found for actionType: ${actionType} and campaign: ${campaign}`)
}

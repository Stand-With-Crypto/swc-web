import { UserActionType } from '@prisma/client'

import { SupportedLocale } from '@/intl/locales'
import { ActiveClientUserActionType } from '@/utils/shared/activeUserAction'
import { getIntlPrefix } from '@/utils/shared/urls'

export const USER_ACTION_DEEPLINK_MAP: Omit<
  {
    [key in ActiveClientUserActionType]: {
      getDeeplinkUrl: (config: { locale: SupportedLocale }) => string
    }
  },
  typeof UserActionType.TWEET
> = {
  [UserActionType.OPT_IN]: {
    getDeeplinkUrl: ({ locale }) => {
      return `${getIntlPrefix(locale)}/action/sign-up`
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

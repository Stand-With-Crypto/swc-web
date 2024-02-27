import { UserActionType } from '@prisma/client'

import { SupportedLocale } from '@/intl/locales'
import { getIntlPrefix } from '@/utils/shared/urls'

export const USER_ACTION_DEEPLINK_MAP: Omit<
  {
    [key in UserActionType]: {
      getDeeplinkUrl: (config: { locale: SupportedLocale; slug?: string }) => string
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
  [UserActionType.LIVE_EVENT]: {
    getDeeplinkUrl: ({ locale, slug }) => {
      return `${getIntlPrefix(locale)}/action/live-event/${slug ?? ''}`
    },
  },
}

export type UserActionTypesWithDeeplink = keyof typeof USER_ACTION_DEEPLINK_MAP

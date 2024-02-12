import { UserActionType } from '@prisma/client'

import { SupportedLocale } from '@/intl/locales'
import { getIntlPrefix } from '@/utils/shared/urls'

export const USER_ACTION_DEEPLINK_MAP: {
  [key in UserActionType]: {
    getDeeplinkUrl: (config: { locale: SupportedLocale }) => string
  }
} = {
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
  [UserActionType.TWEET]: {
    getDeeplinkUrl: ({ locale }) => {
      return `${getIntlPrefix(locale)}/action/tweet`
    },
  },
  [UserActionType.NFT_MINT]: {
    getDeeplinkUrl: ({ locale }) => {
      return `${getIntlPrefix(locale)}/action/nft-mint`
    },
  },
  VOTER_REGISTRATION: {
    getDeeplinkUrl: ({ locale }) => {
      return `${getIntlPrefix(locale)}/action/voter-registration`
    },
  },
}

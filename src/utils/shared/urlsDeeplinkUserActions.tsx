import { SupportedLocale } from '@/intl/locales'
import { getIntlPrefix } from '@/utils/shared/urls'
import { UserActionType } from '@prisma/client'

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
      return `${getIntlPrefix(locale)}/action/donate`
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
}

import { UserActionType } from '@prisma/client'

import { SupportedLocale } from '@/intl/locales'
import { ActiveClientUserActionType } from '@/utils/shared/activeUserAction'
import { getIntlPrefix } from '@/utils/shared/urls'

const parseQueryString = (queryString?: string) => {
  if (!queryString) return ''
  if (queryString.startsWith('?')) return queryString
  return `?${queryString}`
}

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
    getDeeplinkUrl: ({ locale, queryString }) => {
      return `${getIntlPrefix(locale)}/action/call${parseQueryString(queryString)}`
    },
  },
  [UserActionType.EMAIL]: {
    getDeeplinkUrl: ({ locale, queryString }) => {
      return `${getIntlPrefix(locale)}/action/email${parseQueryString(queryString)}`
    },
  },
  [UserActionType.DONATION]: {
    getDeeplinkUrl: ({ locale, queryString }) => {
      return `${getIntlPrefix(locale)}/donate${parseQueryString(queryString)}`
    },
  },
  [UserActionType.NFT_MINT]: {
    getDeeplinkUrl: ({ locale, queryString }) => {
      return `${getIntlPrefix(locale)}/action/nft-mint${parseQueryString(queryString)}`
    },
  },
  [UserActionType.VOTER_REGISTRATION]: {
    getDeeplinkUrl: ({ locale, queryString }) => {
      return `${getIntlPrefix(locale)}/action/voter-registration${parseQueryString(queryString)}`
    },
  },
}

export type UserActionTypesWithDeeplink = keyof typeof USER_ACTION_DEEPLINK_MAP

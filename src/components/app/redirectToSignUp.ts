'use client'

import { useEffect } from 'react'
import { UserActionType } from '@prisma/client'
import { useRouter } from 'next/navigation'

import { setCallbackQueryString } from '@/utils/server/searchParams'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { UrlDestinationsWithoutParams } from '@/utils/shared/urls/types'
import { USER_ACTION_DEEPLINK_MAP } from '@/utils/shared/urlsDeeplinkUserActions'

interface Props {
  locale: SupportedLocale
  callbackDestination: UrlDestinationsWithoutParams | null
}

export function RedirectToSignUpComponent({ locale, callbackDestination }: Props) {
  const router = useRouter()

  useEffect(() => {
    router.replace(
      USER_ACTION_DEEPLINK_MAP[UserActionType.OPT_IN].getDeeplinkUrl({
        locale,
        queryString: setCallbackQueryString({
          destination: callbackDestination,
        }),
      }),
    )
  }, [router, locale, callbackDestination])

  return null
}

'use client'

import { useEffect } from 'react'
import { UserActionType } from '@prisma/client'
import { useRouter } from 'next/navigation'

import { setCallbackQueryString } from '@/utils/server/searchParams'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { UrlDestinationsWithoutParams } from '@/utils/shared/urls/types'
import { USER_ACTION_DEEPLINK_MAP } from '@/utils/shared/urlsDeeplinkUserActions'

interface Props {
  countryCode: SupportedCountryCodes
  callbackDestination: UrlDestinationsWithoutParams | null
}

export function RedirectToSignUpComponent({ countryCode, callbackDestination }: Props) {
  const router = useRouter()

  useEffect(() => {
    router.replace(
      USER_ACTION_DEEPLINK_MAP[UserActionType.OPT_IN].getDeeplinkUrl({
        countryCode,
        queryString: setCallbackQueryString({
          destination: callbackDestination,
        }),
      }),
    )
  }, [router, countryCode, callbackDestination])

  return null
}

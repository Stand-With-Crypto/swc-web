'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

import { ThirdwebLoginContent } from '@/components/app/authentication/thirdwebLoginContent'
import { OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY } from '@/components/app/updateUserProfileForm/queryParamConfig'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { useQueryParamState } from '@/hooks/useQueryParamState'
import { useSession } from '@/hooks/useSession'
import { cn } from '@/utils/web/cn'

export default function UserActionOptInSWCDeepLink() {
  usePreventOverscroll()

  const urls = useIntlUrls()
  const router = useRouter()
  const session = useSession()
  const { queryString } = useQueryParamState({
    queryParamKey: OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY,
    defaultValue: null,
  })
  React.useEffect(() => {
    if (session.isLoggedIn) {
      router.replace(urls.profile(queryString))
    }
  }, [session.isLoggedIn, router, urls, queryString])

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center max-md:h-full ',
        dialogContentPaddingStyles,
        'max-md:pt-16',
      )}
    >
      <ThirdwebLoginContent auth={{ onLogin: () => router.replace(urls.profile(queryString)) }} />
    </div>
  )
}

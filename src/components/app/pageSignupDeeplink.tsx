'use client'
import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'

import { ThirdwebLoginContent } from '@/components/app/authentication/thirdwebLoginContent'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { useSession } from '@/hooks/useSession'
import { getCallbackDestination } from '@/utils/server/searchParams'
import { cn } from '@/utils/web/cn'

export function PageSignupDeeplink() {
  usePreventOverscroll()

  const urls = useIntlUrls()
  const router = useRouter()
  const session = useSession()
  const searchParams = useSearchParams()

  const queryString = searchParams?.toString()

  const { destination } = getCallbackDestination({
    queryString,
    defaultDestination: 'profile',
  })

  const handleRedirectOnLogin = React.useCallback(() => {
    // if the destination returned is not actually a valid destination,
    // we should gracefully fail, redirecting the user to the profile page
    try {
      return router.replace(urls[destination]())
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          domain: 'handleRedirectOnLogin',
          message: `${destination} is not a valid destination`,
        },
        extra: {
          queryString,
        },
      })
      return router.replace(urls.profile())
    }
  }, [destination, router, urls, queryString])

  React.useEffect(() => {
    if (session.isLoggedIn && session.hasOptInUserAction) {
      handleRedirectOnLogin()
    }
  }, [session.isLoggedIn, session.hasOptInUserAction, handleRedirectOnLogin])

  if (session.isLoading || session.isLoggedIn) return null

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center max-md:h-full ',
        dialogContentPaddingStyles,
        'max-md:pt-16',
      )}
    >
      <ThirdwebLoginContent onLoginCallback={() => handleRedirectOnLogin()} />
    </div>
  )
}

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

export default function UserActionOptInSWCDeepLink() {
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
    // should always have a destination, but if something happens and thats no the case,
    // we should gracefully fail, redirecting the user to the profile page
    if (!destination) {
      Sentry.captureMessage(
        'Failed to redirect to destination after login, no destination received from getCallbackDestination',
        {
          user: { queryString },
        },
      )
      return router.replace(urls.profile())
    }

    return router.replace(urls[destination]())
  }, [destination, router, urls, queryString])

  React.useEffect(() => {
    if (session.isLoggedIn) {
      handleRedirectOnLogin()
    }
  }, [session.isLoggedIn, handleRedirectOnLogin])

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center max-md:h-full ',
        dialogContentPaddingStyles,
        'max-md:pt-16',
      )}
    >
      <ThirdwebLoginContent
        auth={{
          onLogin: () => handleRedirectOnLogin(),
        }}
      />
    </div>
  )
}

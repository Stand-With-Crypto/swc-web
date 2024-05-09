'use client'
import React from 'react'
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

  const { destination } = getCallbackDestination({
    queryString: searchParams?.toString(),
    defaultDestination: 'profile',
  })

  const handleRedirectOnLogin = React.useCallback(() => {
    return router.replace(urls[destination]())
  }, [router, urls, destination])

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

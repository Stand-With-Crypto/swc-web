'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

import { ThirdwebLoginContent } from '@/components/app/authentication/thirdwebLoginContent'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { usePreventIOSOverscroll } from '@/hooks/usePreventIOSOverscroll'
import { useSession } from '@/hooks/useSession'
import { cn } from '@/utils/web/cn'

export default function UserActionOptInSWCDeepLink() {
  usePreventIOSOverscroll()

  const urls = useIntlUrls()
  const router = useRouter()
  const session = useSession()
  React.useEffect(() => {
    if (session.isLoggedIn) {
      router.replace(urls.profile())
    }
  }, [session.isLoggedIn, router, urls])

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center max-md:h-full ',
        dialogContentPaddingStyles,
        'max-md:pt-16',
      )}
    >
      <ThirdwebLoginContent auth={{ onLogin: () => router.replace(urls.profile()) }} />
    </div>
  )
}

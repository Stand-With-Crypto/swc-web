'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

import { ThirdwebLoginContent } from '@/components/app/authentication/thirdwebLoginContent'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { useThirdwebData } from '@/hooks/useThirdwebData'
import { cn } from '@/utils/web/cn'

export default function UserActionOptInSWCDeepLink() {
  const urls = useIntlUrls()
  const router = useRouter()
  const { session } = useThirdwebData()

  React.useEffect(() => {
    if (session.isLoggedIn) {
      router.replace(urls.profile())
    }
  }, [session.isLoggedIn, router, urls])

  return (
    <div className={cn('flex items-center justify-center', dialogContentPaddingStyles)}>
      <ThirdwebLoginContent auth={{ onLogin: () => router.replace(urls.profile()) }} />
    </div>
  )
}

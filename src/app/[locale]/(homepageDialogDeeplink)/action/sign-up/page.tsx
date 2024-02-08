'use client'
import { ThirdwebLoginContent } from '@/components/app/authentication/thirdwebLoginContent'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { useThirdwebData } from '@/hooks/useThirdwebData'
import { cn } from '@/utils/web/cn'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function UserActionOptInSWCDeepLink() {
  const urls = useIntlUrls()
  const router = useRouter()
  const { session } = useThirdwebData()

  React.useEffect(() => {
    if (session.isLoggedIn) {
      router.replace(urls.profile())
    }
  }, [session.isLoggedIn, router, urls])

  if (session.isLoading || session.isLoggedIn) {
    return <LoadingOverlay />
  }
  return (
    <div className={cn('flex items-center justify-center', dialogContentPaddingStyles)}>
      <ThirdwebLoginContent auth={{ onLogin: () => router.replace(urls.profile()) }} />
    </div>
  )
}

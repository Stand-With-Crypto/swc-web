'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

import { ThirdwebLoginContent } from '@/components/app/authentication/thirdwebLoginContent'
import { DialogBody } from '@/components/ui/dialog'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { useSession } from '@/hooks/useSession'

export default function UserActionOptInSWCDeepLink() {
  const urls = useIntlUrls()
  const router = useRouter()
  const session = useSession()
  React.useEffect(() => {
    if (session.isLoggedIn) {
      router.replace(urls.profile())
    }
  }, [session.isLoggedIn, router, urls])

  return (
    <DialogBody>
      <ThirdwebLoginContent auth={{ onLogin: () => router.replace(urls.profile()) }} />
    </DialogBody>
  )
}

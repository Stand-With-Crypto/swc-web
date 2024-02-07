'use client'
import { AutoOpenAuthModal } from '@/components/app/authentication/autoOpenAuthModal'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { useThirdwebData } from '@/hooks/useThirdwebData'
import { UserActionType } from '@prisma/client'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function UserActionOptInSWCDeepLink() {
  const urls = useIntlUrls()
  const router = useRouter()
  const { data } = useApiResponseForUserPerformedUserActionTypes()
  const { session } = useThirdwebData()

  React.useEffect(() => {
    if (data?.performedUserActionTypes.includes(UserActionType.OPT_IN)) {
      router.replace(urls.profile())
    }
  }, [data, router, urls])

  if (!data || session.isLoading || session.isLoggedIn) {
    return <LoadingOverlay />
  }
  return (
    <div className="flex items-center justify-center">
      <AutoOpenAuthModal>Login</AutoOpenAuthModal>
    </div>
  )
}

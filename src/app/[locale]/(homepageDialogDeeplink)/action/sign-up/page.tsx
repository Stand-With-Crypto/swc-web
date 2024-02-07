'use client'
import { AccountAuth } from '@/components/app/accountAuth'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { UserActionType } from '@prisma/client'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function UserActionOptInSWCDeepLink() {
  const urls = useIntlUrls()
  const router = useRouter()
  const { data } = useApiResponseForUserPerformedUserActionTypes()

  React.useEffect(() => {
    if (data?.performedUserActionTypes.includes(UserActionType.OPT_IN)) {
      router.replace(urls.profile())
    }
  }, [data, router, urls])

  return (
    <AccountAuth
      isLoading={
        typeof data === 'undefined' ||
        data?.performedUserActionTypes.includes(UserActionType.OPT_IN)
      }
      onClose={() => {
        router.replace(urls.home())
      }}
    />
  )
}

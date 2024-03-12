'use client'
import React from 'react'
import { UserInformationVisibility } from '@prisma/client'
import { useENS } from '@thirdweb-dev/react'

import { useSession } from '@/hooks/useSession'
import { appendENSHookDataToUser } from '@/utils/web/appendENSHookDataToUser'

export function useUserWithMaybeENSData() {
  const ensData = useENS()
  const { user, isLoggedInThirdweb } = useSession()

  return React.useMemo(() => {
    if (!user) {
      return null
    }

    if (!isLoggedInThirdweb) {
      return appendENSHookDataToUser(user, null)
    }

    const shouldWaitForEnsData =
      user.informationVisibility === UserInformationVisibility.CRYPTO_INFO_ONLY

    if (shouldWaitForEnsData && ensData.isLoading) {
      return null
    }

    return appendENSHookDataToUser(user, shouldWaitForEnsData ? ensData.data : null)
  }, [ensData, user, isLoggedInThirdweb])
}

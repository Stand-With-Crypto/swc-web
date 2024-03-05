import React from 'react'
import { UserInformationVisibility } from '@prisma/client'
import { useENS } from '@thirdweb-dev/react'

import { ClientUser } from '@/clientModels/clientUser/clientUser'
import { appendENSHookDataToUser } from '@/utils/web/appendENSHookDataToUser'

export function useUserWithMaybeENSData<U extends ClientUser>({ user }: { user?: U | null }) {
  const ensData = useENS()

  return React.useMemo(() => {
    if (!user) {
      return null
    }

    const shouldWaitForEnsData =
      user.informationVisibility === UserInformationVisibility.CRYPTO_INFO_ONLY

    if (shouldWaitForEnsData && ensData.isLoading) {
      return null
    }

    return appendENSHookDataToUser(user, shouldWaitForEnsData ? ensData.data : null)
  }, [ensData, user])
}

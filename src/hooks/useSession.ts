import { useMemo } from 'react'

import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useThirdwebData } from '@/hooks/useThirdwebData'

export function useSession() {
  const fullProfileRequest = useApiResponseForUserFullProfileInfo()
  const { session: thirdwebSession, logoutAndDisconnect } = useThirdwebData()

  return useMemo(() => {
    const isLoading = thirdwebSession.isLoading || fullProfileRequest.isLoading

    const emailAddress = fullProfileRequest.data?.user?.primaryUserEmailAddress
    const isLoggedIn = thirdwebSession.isLoggedIn || !!emailAddress?.isVerified

    return {
      isLoading,
      isLoggedIn,
      logout: logoutAndDisconnect,
    }
  }, [fullProfileRequest, logoutAndDisconnect, thirdwebSession])
}

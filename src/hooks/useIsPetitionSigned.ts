'use client'

import { useMemo } from 'react'
import { UserActionType } from '@prisma/client'

import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'

export function useIsPetitionSigned(petitionSlug: string) {
  const { data: userData, isLoading } = useApiResponseForUserFullProfileInfo()

  const petitionUserAction = useMemo(() => {
    return userData?.user?.userActions?.find(
      userAction =>
        userAction.actionType === UserActionType.SIGN_PETITION &&
        userAction.campaignName === petitionSlug,
    )
  }, [userData?.user?.userActions, petitionSlug])

  const isPetitionSigned = useMemo(() => {
    return petitionUserAction?.actionType === UserActionType.SIGN_PETITION
  }, [petitionUserAction])

  return { isPetitionSigned, isLoading, petitionUserAction }
}

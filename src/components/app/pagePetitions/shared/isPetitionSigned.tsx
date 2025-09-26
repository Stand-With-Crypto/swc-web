import { UserActionType } from '@prisma/client'

import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'

export function isPetitionSigned({
  userData,
  petition,
}: {
  userData: Awaited<ReturnType<typeof useApiResponseForUserFullProfileInfo>>['data']
  petition: SWCPetition
}) {
  return userData?.user?.userActions?.some(
    userAction =>
      userAction.actionType === UserActionType.SIGN_PETITION &&
      userAction.campaignName === petition.slug,
  )
}

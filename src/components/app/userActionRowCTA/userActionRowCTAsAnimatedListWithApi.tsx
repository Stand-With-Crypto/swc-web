'use client'

import { UserActionType } from '@prisma/client'

import { UserActionRowCTAsAnimatedList } from '@/components/app/userActionRowCTA/userActionRowCTAsAnimatedList'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'

type UserActionRowCTAsListWithApiProps = {
  excludeUserActionTypes?: UserActionType[]
}
export function UserActionRowCTAsAnimatedListWithApi({
  excludeUserActionTypes,
}: UserActionRowCTAsListWithApiProps) {
  const { data } = useApiResponseForUserPerformedUserActionTypes()
  const performedUserActions = data?.performedUserActionTypes.map(
    performedAction => performedAction.actionType,
  )
  return (
    <UserActionRowCTAsAnimatedList
      excludeUserActionTypes={excludeUserActionTypes}
      performedUserActionTypes={performedUserActions}
    />
  )
}

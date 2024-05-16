'use client'

import { UserActionType } from '@prisma/client'

import { UserActionRowCTAsList } from '@/components/app/userActionRowCTA/userActionRowCTAsList'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'

type UserActionRowCTAsListWithApiProps = {
  excludeUserActionTypes?: UserActionType[]
}
export function UserActionRowCTAsListWithApi({
  excludeUserActionTypes,
}: UserActionRowCTAsListWithApiProps) {
  const { data } = useApiResponseForUserPerformedUserActionTypes()
  const performedUserActions = data?.performedUserActionTypes.map(
    performedAction => performedAction.actionType,
  )
  return (
    <UserActionRowCTAsList
      excludeUserActionTypes={excludeUserActionTypes}
      performedUserActionTypes={performedUserActions}
    />
  )
}

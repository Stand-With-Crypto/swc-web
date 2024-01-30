'use client'
import { GetUserPerformedUserActionTypesResponse } from '@/app/api/identified-user/performed-user-action-types/route'
import { ORDERED_USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/userActionRowCTAsList'

export function getNextAction(
  performedUserActionTypes: GetUserPerformedUserActionTypesResponse['performedUserActionTypes'],
) {
  const action = ORDERED_USER_ACTION_ROW_CTA_INFO.find(
    action => !performedUserActionTypes.includes(action.actionType),
  )
  if (action) {
    const { WrapperComponent: _WrapperComponent, ...rest } = action
    return rest
  }
  return null
}

'use client'

import { GetUserPerformedUserActionTypesResponse } from '@/app/api/identified-user/performed-user-action-types/route'
import { USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/constants'
import { USER_ACTION_TYPE_PRIORITY_ORDER } from '@/utils/web/userActionUtils'

export function getNextAction(
  performedUserActionTypes: GetUserPerformedUserActionTypesResponse['performedUserActionTypes'],
) {
  const action = USER_ACTION_TYPE_PRIORITY_ORDER.find(
    actionType => !performedUserActionTypes.includes(actionType),
  )
  if (action) {
    const { WrapperComponent: _WrapperComponent, ...rest } = USER_ACTION_ROW_CTA_INFO[action]
    return rest
  }
  return null
}

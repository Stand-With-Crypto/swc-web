'use client'

import { UserActionType } from '@prisma/client'

import { GetUserPerformedUserActionTypesResponse } from '@/app/api/identified-user/performed-user-action-types/route'
import { getUserActionCTAInfo } from '@/components/app/userActionRowCTA/constants'
import { USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN } from '@/utils/web/userActionUtils'

export function getNextAction(
  performedUserActionTypes: GetUserPerformedUserActionTypesResponse['performedUserActionTypes'],
) {
  const nextAction = USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN.filter(
    x => x.action !== UserActionType.OPT_IN,
  ).find(
    userAction =>
      !performedUserActionTypes.some(
        performedAction =>
          performedAction.actionType === userAction.action &&
          performedAction.campaignName === userAction.campaign,
      ),
  )

  if (nextAction) {
    const CTAInfo = getUserActionCTAInfo(nextAction.action, nextAction.campaign)

    if (!CTAInfo) return null

    const { WrapperComponent: _WrapperComponent, ...rest } = CTAInfo
    return rest
  }
  return null
}

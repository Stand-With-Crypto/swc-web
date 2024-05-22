'use client'

import { useMemo } from 'react'
import { UserActionType } from '@prisma/client'

import { UserActionRowCTA } from '@/components/app/userActionRowCTA'
import { getUserActionCTAInfo } from '@/components/app/userActionRowCTA/constants'
import { cn } from '@/utils/web/cn'
import { USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN } from '@/utils/web/userActionUtils'

export interface UserActionRowCTAsListProps {
  performedUserActionTypes?: Array<{ actionType: UserActionType; campaignName: string }>
  excludeUserActionTypes?: UserActionType[]
  className?: string
  render?: (props: React.ComponentPropsWithoutRef<typeof UserActionRowCTA>) => React.ReactNode
}

export function UserActionRowCTAsList({
  performedUserActionTypes,
  excludeUserActionTypes,
  render,
  className,
}: UserActionRowCTAsListProps) {
  const filteredActions = useMemo(() => {
    return !excludeUserActionTypes
      ? USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN
      : USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN.filter(
          ({ action }) => !excludeUserActionTypes.includes(action),
        )
  }, [excludeUserActionTypes])

  return (
    <div className={cn('space-y-4', className)}>
      {filteredActions.map(({ action, campaign }) => {
        const props = getUserActionCTAInfo(action, campaign)

        const state = !performedUserActionTypes
          ? 'unknown'
          : performedUserActionTypes.some(
                performedAction =>
                  performedAction.actionType === action &&
                  performedAction.campaignName === campaign,
              )
            ? 'complete'
            : 'incomplete'

        return render ? (
          render({ state, ...props })
        ) : (
          <UserActionRowCTA key={`${action}-${campaign}`} state={state} {...props} />
        )
      })}
    </div>
  )
}

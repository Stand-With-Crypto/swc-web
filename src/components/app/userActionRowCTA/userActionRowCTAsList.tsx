'use client'

import { useMemo } from 'react'
import { UserActionType } from '@prisma/client'

import { UserActionRowCTA, UserActionRowCTAProps } from '@/components/app/userActionRowCTA'
import { getUserActionCTAInfo } from '@/components/app/userActionRowCTA/constants'
import { cn } from '@/utils/web/cn'
import { USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN } from '@/utils/web/userActionUtils'

export interface UserActionRowCTAsListProps {
  performedUserActionTypes?: Array<{ actionType: UserActionType; campaignName: string }>
  excludeUserActionTypes?: UserActionType[]
  className?: string
  render?: React.ComponentType<React.ComponentPropsWithoutRef<typeof UserActionRowCTA>>
}

export function UserActionRowCTAsList({
  performedUserActionTypes,
  excludeUserActionTypes,
  className,
  render: Render,
}: UserActionRowCTAsListProps) {
  const filteredActions = useMemo(() => {
    return !excludeUserActionTypes
      ? USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN
      : USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN.filter(
          ({ action }) => !excludeUserActionTypes.includes(action),
        )
  }, [excludeUserActionTypes])

  const getState = useMemo(
    () => createStateGetter(performedUserActionTypes),
    [performedUserActionTypes],
  )

  return (
    <div className={cn('space-y-4', className)}>
      {filteredActions.map(({ action, campaign }) => {
        const props = getUserActionCTAInfo(action, campaign)
        const state = getState({ action, campaign })

        return Render ? (
          <Render key={`${action}-${campaign}`} state={state} {...props} />
        ) : (
          <UserActionRowCTA key={`${action}-${campaign}`} state={state} {...props} />
        )
      })}
    </div>
  )
}

const createStateGetter =
  (
    performedUserActionTypes:
      | Array<{ actionType: UserActionType; campaignName: string }>
      | undefined,
  ) =>
  ({
    action,
    campaign,
  }: {
    action: UserActionType
    campaign: string
  }): UserActionRowCTAProps['state'] => {
    if (!performedUserActionTypes) return 'unknown'

    return performedUserActionTypes.some(
      performedAction =>
        performedAction.actionType === action && performedAction.campaignName === campaign,
    )
      ? 'complete'
      : 'incomplete'
  }

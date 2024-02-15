'use client'

import { useMemo } from 'react'
import { UserActionType } from '@prisma/client'

import { UserActionRowCTA } from '@/components/app/userActionRowCTA'
import { USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/constants'
import { cn } from '@/utils/web/cn'
import { USER_ACTION_TYPE_PRIORITY_ORDER } from '@/utils/web/userActionUtils'

export function UserActionRowCTAsList({
  performedUserActionTypes,
  excludeUserActionTypes,
  className,
}: {
  className?: string
  performedUserActionTypes?: UserActionType[]
  excludeUserActionTypes?: UserActionType[]
}) {
  const filteredActions = useMemo(
    () =>
      !excludeUserActionTypes
        ? USER_ACTION_TYPE_PRIORITY_ORDER
        : USER_ACTION_TYPE_PRIORITY_ORDER.filter(
            actionType => !excludeUserActionTypes.includes(actionType),
          ),
    [excludeUserActionTypes],
  )
  return (
    <div className={cn('space-y-4', className)}>
      {filteredActions.map(actionType => {
        const props = USER_ACTION_ROW_CTA_INFO[actionType]
        return (
          <UserActionRowCTA
            key={actionType}
            state={
              !performedUserActionTypes
                ? 'unknown'
                : performedUserActionTypes.includes(actionType)
                  ? 'complete'
                  : 'incomplete'
            }
            {...props}
          />
        )
      })}
    </div>
  )
}

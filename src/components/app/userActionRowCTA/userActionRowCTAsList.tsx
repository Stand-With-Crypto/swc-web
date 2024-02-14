'use client'

import { useMemo } from 'react'
import { UserActionType } from '@prisma/client'

import { UserActionRowCTA } from '@/components/app/userActionRowCTA'
import { cn } from '@/utils/web/cn'

import { ORDERED_USER_ACTION_ROW_CTA_INFO } from './constants'

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
        ? ORDERED_USER_ACTION_ROW_CTA_INFO
        : ORDERED_USER_ACTION_ROW_CTA_INFO.filter(
            action => !excludeUserActionTypes.includes(action.actionType),
          ),
    [excludeUserActionTypes],
  )
  return (
    <div className={cn('space-y-4', className)}>
      {filteredActions.map(({ actionType, ...rest }) => (
        <UserActionRowCTA
          key={actionType}
          state={
            !performedUserActionTypes
              ? 'unknown'
              : performedUserActionTypes.includes(actionType)
                ? 'complete'
                : 'incomplete'
          }
          {...{ actionType, ...rest }}
        />
      ))}
    </div>
  )
}

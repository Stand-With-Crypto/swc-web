'use client'

import { UserActionRowCTA } from '@/components/app/userActionRowCTA'
import { USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/userActionRowCTAConstants'
import { usePerformedUserActionTypes } from '@/hooks/usePerformedUserActionTypes'

export function ClientAuthUserActionRowCTAs() {
  const { data } = usePerformedUserActionTypes()
  return (
    <div className="space-y-4">
      {USER_ACTION_ROW_CTA_INFO.map(({ actionType, ...rest }) => (
        <UserActionRowCTA
          key={actionType}
          state={
            !data
              ? 'unknown'
              : data.performedUserActionTypes.includes(actionType)
                ? 'complete'
                : 'incomplete'
          }
          {...{ actionType, ...rest }}
        />
      ))}
    </div>
  )
}

'use client'

import { UserActionRowCTA } from '@/components/app/userActionRowCTA'
import { USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/userActionRowCTAConstants'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'

export function ClientAuthUserActionRowCTAs() {
  const { data } = useApiResponseForUserPerformedUserActionTypes()
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

'use client'

import { getPerformedUserActionTypes } from '@/app/api/authenticated/performed-user-action-types/route'
import { UserActionRowCTA } from '@/components/app/userActionRowCTA'
import { USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/userActionRowCTAConstants'
import { MaybeAuthenticatedApiResponse } from '@/types'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import { useAuth } from '@thirdweb-dev/react'
import useSWR from 'swr'

function usePerformedUserActionTypes() {
  const props = useSWR(
    apiUrls.performedUserActionTypes(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as MaybeAuthenticatedApiResponse<typeof getPerformedUserActionTypes>),
    {
      refreshInterval: 1000,
    },
  )
  return {
    ...props,
    data: props.data
      ? 'performedUserActionTypes' in props.data
        ? props.data
        : { performedUserActionTypes: [] }
      : undefined,
  }
}

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

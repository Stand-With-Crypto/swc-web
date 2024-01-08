'use client'

import { UserActionRowCTAsList } from '@/components/app/userActionRowCTA/userActionRowCTAsList'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'

export function UserActionRowCTAsListWithApi() {
  const { data } = useApiResponseForUserPerformedUserActionTypes()
  return <UserActionRowCTAsList performedUserActionTypes={data?.performedUserActionTypes} />
}

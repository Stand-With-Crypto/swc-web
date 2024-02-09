'use client'
import { UserActionFormSuccessScreenMainCTA } from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenMainCTA'
import { UserActionFormSuccessScreenNextAction } from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenNextAction'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useMemo } from 'react'

type Props = React.ComponentPropsWithoutRef<typeof UserActionFormSuccessScreenMainCTA>

export function UserActionFormSuccessScreenContent(props: Props) {
  return (
    <div className="flex min-h-[400px] flex-col">
      <div className="flex flex-grow items-center">
        <UserActionFormSuccessScreenMainCTA {...props} />
      </div>
      <UserActionFormSuccessScreenNextAction {...props} />
    </div>
  )
}

export function UserActionFormSuccessScreen(props: Omit<Props, 'data'>) {
  const userData = useApiResponseForUserFullProfileInfo()
  const performedActionsData = useApiResponseForUserPerformedUserActionTypes()

  const data = useMemo(() => {
    if (!userData.data || !performedActionsData.data) {
      return undefined
    }
    const { user } = userData.data
    const { performedUserActionTypes } = performedActionsData.data
    return {
      performedUserActionTypes,
      user,
    }
  }, [userData, performedActionsData])
  return <UserActionFormSuccessScreenContent {...props} data={data} />
}

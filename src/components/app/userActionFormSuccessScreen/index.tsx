'use client'
import { useMemo } from 'react'

import { UserActionFormSuccessScreenMainCTA } from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenMainCTA'
import { UserActionFormSuccessScreenNextAction } from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenNextAction'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'

type Props = React.ComponentPropsWithoutRef<typeof UserActionFormSuccessScreenMainCTA>

interface UserActionFormSuccessScreenProps extends Omit<Props, 'data'> {
  children: React.ReactNode
}

export function UserActionFormSuccessScreen({
  children,
  ...props
}: UserActionFormSuccessScreenProps) {
  const userData = useApiResponseForUserFullProfileInfo({ revalidateOnMount: true })
  const performedActionsData = useApiResponseForUserPerformedUserActionTypes({
    revalidateOnMount: true,
  })

  const data = useMemo(() => {
    if (!userData.data || !performedActionsData.data) {
      return undefined
    }
    const { user } = userData.data
    const { performedUserActionTypes } = performedActionsData.data
    return {
      user,
      performedUserActionTypes,
    }
  }, [userData, performedActionsData])

  return (
    <div className="flex min-h-[400px] flex-col gap-6">
      <UserActionFormSuccessScreenMainCTA {...props} data={data}>
        {children}
      </UserActionFormSuccessScreenMainCTA>

      <UserActionFormSuccessScreenNextAction data={data} />
    </div>
  )
}

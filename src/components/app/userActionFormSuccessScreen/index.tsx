'use client'
import { useMemo } from 'react'

import { SMSOptInForm } from '@/components/app/userActionFormSuccessScreen/smsOptInForm'
import { UserActionFormSuccessScreenMainCTA } from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenMainCTA'
import { UserActionFormSuccessScreenNextAction } from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenNextAction'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'

type Props = React.ComponentPropsWithoutRef<typeof UserActionFormSuccessScreenMainCTA>

// interface UserActionFormSuccessScreenProps extends Omit<Props, 'data'> {
//   children: React.ReactNode
// }

interface UserActionFormSuccessScreenProps {
  children: React.ReactNode
  onClose: () => void
}

export function UserActionFormSuccessScreen(props: UserActionFormSuccessScreenProps) {
  const { onClose } = props

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

  if (userData.isLoading) {
    /**
     * TODO: Skeleton
     */
    return <div className="text-xl text-red-500">Loading...</div>
  }

  if (!data?.user?.phoneNumber || !data?.user?.hasOptedInToSms) {
    return (
      <div className="h-full min-h-[400px]">
        <SMSOptInForm
          initialValues={{ phoneNumber: data?.user?.phoneNumber || '' }}
          onSuccess={onClose}
        />
      </div>
    )
  }

  return (
    <div className="h-full min-h-[400px]">
      <UserActionFormSuccessScreenMainCTA {...props} data={data} />

      <UserActionFormSuccessScreenNextAction data={data} />
    </div>
  )
}

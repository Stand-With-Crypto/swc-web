'use client'
import { useMemo } from 'react'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { JoinSWC } from '@/components/app/userActionFormSuccessScreen/joinSWC'
import { SMSOptInContent } from '@/components/app/userActionFormSuccessScreen/smsOptInForm'
import { UserActionFormSuccessScreenNextAction } from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenNextAction'
import { Button } from '@/components/ui/button'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'

interface UserActionFormSuccessScreenProps {
  children: React.ReactNode
  onClose: () => void
}

export function UserActionFormSuccessScreen(props: UserActionFormSuccessScreenProps) {
  const { children, onClose } = props

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

  if (!data?.user) {
    return <JoinSWC onClose={onClose} />
  }

  if (!data?.user?.phoneNumber || !data?.user?.hasOptedInToSms) {
    return (
      <div className="mx-auto h-full max-w-[450px]">
        <SMSOptInContent
          initialValues={{ phoneNumber: data?.user?.phoneNumber || '' }}
          onSuccess={onClose}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-8 lg:max-h-[75vh]">
      {children}

      <UserActionFormSuccessScreenNextAction data={data} />
    </div>
  )
}

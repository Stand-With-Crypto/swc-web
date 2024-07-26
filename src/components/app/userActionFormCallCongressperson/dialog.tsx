'use client'

import { Suspense } from 'react'

import { UserActionFormCallCongressperson } from '@/components/app/userActionFormCallCongressperson'
import { ANALYTICS_NAME_USER_ACTION_FORM_CALL_CONGRESSPERSON } from '@/components/app/userActionFormCallCongressperson/constants'
import { LazyUserActionFormCallCongressperson } from '@/components/app/userActionFormCallCongressperson/lazyLoad'
import { UserActionFormCallCongresspersonSkeleton } from '@/components/app/userActionFormCallCongressperson/skeleton'
import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'

export function UserActionFormCallCongresspersonDialog({
  children,
  defaultOpen = false,
  ...formProps
}: Omit<React.ComponentProps<typeof UserActionFormCallCongressperson>, 'user' | 'onClose'> & {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_CALL_CONGRESSPERSON,
  })
  const { data, isLoading } = useApiResponseForUserFullProfileInfo()
  const { user } = data ?? { user: null }

  return (
    <UserActionFormDialog {...dialogProps} trigger={children}>
      {isLoading ? (
        <UserActionFormCallCongresspersonSkeleton />
      ) : (
        <Suspense fallback={<UserActionFormCallCongresspersonSkeleton />}>
          <LazyUserActionFormCallCongressperson
            {...formProps}
            onClose={() => dialogProps.onOpenChange(false)}
            user={user}
          />
        </Suspense>
      )}
    </UserActionFormDialog>
  )
}

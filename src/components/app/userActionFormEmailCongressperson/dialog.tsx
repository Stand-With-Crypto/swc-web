'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON } from '@/components/app/userActionFormEmailCongressperson/common/constants'
import { UserActionFormEmailCongresspersonSkeleton } from '@/components/app/userActionFormEmailCongressperson/skeleton'
import { FormFields } from '@/components/app/userActionFormEmailCongressperson/types'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const UserActionFormEmailCongressperson = dynamic(
  () =>
    import('@/components/app/userActionFormEmailCongressperson').then(
      mod => mod.UserActionFormEmailCongressperson,
    ),
  {
    loading: () => (
      <UserActionFormEmailCongresspersonSkeleton countryCode={SupportedCountryCodes.US} />
    ),
  },
)

interface UserActionFormEmailCongresspersonDialogProps {
  children: React.ReactNode
  defaultOpen?: boolean
  initialValues?: FormFields
  countryCode: SupportedCountryCodes
}

export function UserActionFormEmailCongresspersonDialog({
  children,
  defaultOpen = false,
  initialValues,
  countryCode,
}: UserActionFormEmailCongresspersonDialogProps) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON,
  })
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const { user } = fetchUser.data || { user: null }

  if (fetchUser.isLoading) {
    return (
      <UserActionFormDialog {...dialogProps} padding={false} trigger={children}>
        <UserActionFormEmailCongresspersonSkeleton countryCode={countryCode} />
      </UserActionFormDialog>
    )
  }

  return (
    <UserActionFormDialog {...dialogProps} padding={false} trigger={children}>
      <Suspense fallback={<UserActionFormEmailCongresspersonSkeleton countryCode={countryCode} />}>
        <UserActionFormEmailCongressperson
          countryCode={countryCode}
          initialValues={initialValues}
          onCancel={() => dialogProps.onOpenChange(false)}
          user={user}
        />
      </Suspense>
    </UserActionFormDialog>
  )
}

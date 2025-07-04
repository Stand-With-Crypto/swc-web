'use client'

import { lazy, Suspense, useCallback } from 'react'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON } from '@/components/app/userActionFormEmailCongressperson/common/constants'
import { UserActionFormEmailCongresspersonSkeleton } from '@/components/app/userActionFormEmailCongressperson/common/skeleton'
import {
  EmailActionCampaignNames,
  FormFields,
} from '@/components/app/userActionFormEmailCongressperson/common/types'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const LazyUserActionFormEmailCongressperson = lazy(() =>
  import('@/components/app/userActionFormEmailCongressperson').then(m => ({
    default: m.UserActionFormEmailCongressperson,
  })),
)

export type UserActionFormEmailCongresspersonDialogProps = React.PropsWithChildren & {
  defaultOpen?: boolean
  initialValues?: FormFields
  countryCode: SupportedCountryCodes
  campaignName: EmailActionCampaignNames
}

export function UserActionFormEmailCongresspersonDialog({
  children,
  defaultOpen = false,
  ...props
}: UserActionFormEmailCongresspersonDialogProps) {
  const { countryCode } = props

  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON,
  })
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const { user } = fetchUser.data || { user: null }

  const onCancel = useCallback(() => dialogProps.onOpenChange(false), [dialogProps])

  if (fetchUser.isLoading) {
    return (
      <UserActionFormDialog {...dialogProps} padding={false} trigger={children}>
        <UserActionFormEmailCongresspersonSkeleton {...props} />
      </UserActionFormDialog>
    )
  }

  return (
    <UserActionFormDialog
      {...dialogProps}
      countryCode={countryCode}
      padding={false}
      trigger={children}
    >
      <Suspense fallback={<UserActionFormEmailCongresspersonSkeleton {...props} />}>
        <LazyUserActionFormEmailCongressperson {...props} onCancel={onCancel} user={user} />
      </Suspense>
    </UserActionFormDialog>
  )
}

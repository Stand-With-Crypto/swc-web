'use client'

import { lazy, Suspense, useCallback } from 'react'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { ANALYTICS_NAME_USER_ACTION_FORM_LETTER } from '@/components/app/userActionFormLetter/common/constants'
import { UserActionFormLetterSkeleton } from '@/components/app/userActionFormLetter/common/skeleton'
import {
  FormFields,
  LetterActionCampaignNames,
} from '@/components/app/userActionFormLetter/common/types'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const LazyUserActionFormLetter = lazy(() =>
  import('@/components/app/userActionFormLetter').then(m => ({
    default: m.UserActionFormLetter,
  })),
)

export type UserActionFormLetterDialogProps = React.PropsWithChildren & {
  defaultOpen?: boolean
  initialValues?: FormFields
  countryCode: SupportedCountryCodes
  campaignName: LetterActionCampaignNames
}

export function UserActionFormLetterDialog({
  children,
  defaultOpen = false,
  ...props
}: UserActionFormLetterDialogProps) {
  const { countryCode } = props

  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_LETTER,
  })
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const { user } = fetchUser.data || { user: null }

  const onCancel = useCallback(() => dialogProps.onOpenChange(false), [dialogProps])

  if (fetchUser.isLoading) {
    return (
      <UserActionFormDialog {...dialogProps} padding={false} trigger={children}>
        <UserActionFormLetterSkeleton {...props} />
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
      <Suspense fallback={<UserActionFormLetterSkeleton {...props} />}>
        <LazyUserActionFormLetter {...props} onCancel={onCancel} user={user} />
      </Suspense>
    </UserActionFormDialog>
  )
}

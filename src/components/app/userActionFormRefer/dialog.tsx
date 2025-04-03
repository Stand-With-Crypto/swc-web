'use client'

import dynamic from 'next/dynamic'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { ANALYTICS_NAME_USER_ACTION_FORM_REFER } from '@/components/app/userActionFormRefer/common/constants'
import { UserActionFormReferSkeleton } from '@/components/app/userActionFormRefer/common/skeleton'
import { useDialog } from '@/hooks/useDialog'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface UserActionFormReferDialogProps {
  children: React.ReactNode
  countryCode: SupportedCountryCodes
  defaultOpen?: boolean
}

export function UserActionFormReferDialog(props: UserActionFormReferDialogProps) {
  const { children, countryCode, defaultOpen = false } = props

  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_REFER,
  })

  const UserActionFormRefer = dynamic(
    () => import('@/components/app/userActionFormRefer').then(mod => mod.UserActionFormRefer),
    {
      loading: () => <UserActionFormReferSkeleton countryCode={countryCode} />,
    },
  )

  return (
    <UserActionFormDialog
      {...dialogProps}
      className="max-w-xl"
      countryCode={countryCode}
      trigger={children}
    >
      <UserActionFormRefer
        countryCode={countryCode}
        onClose={() => dialogProps.onOpenChange(false)}
      />
    </UserActionFormDialog>
  )
}

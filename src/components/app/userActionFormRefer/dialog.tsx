'use client'

import dynamic from 'next/dynamic'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { ANALYTICS_NAME_USER_ACTION_FORM_REFER } from '@/components/app/userActionFormRefer/common/constants'
import { UserActionFormReferSkeleton } from '@/components/app/userActionFormRefer/common/skeleton'
import { useDialog } from '@/hooks/useDialog'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const UserActionFormRefer = dynamic(
  () => import('@/components/app/userActionFormRefer').then(mod => mod.UserActionFormRefer),
  {
    loading: () => <UserActionFormReferSkeleton />,
  },
)

interface UserActionFormReferDialogProps {
  children: React.ReactNode
  defaultOpen?: boolean
  countryCode?: SupportedCountryCodes
}

export function UserActionFormReferDialog({
  children,
  defaultOpen = false,
  countryCode = SupportedCountryCodes.US,
}: UserActionFormReferDialogProps) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_REFER,
  })

  return (
    <UserActionFormDialog {...dialogProps} className="max-w-xl" trigger={children}>
      <UserActionFormRefer
        countryCode={countryCode}
        onClose={() => dialogProps.onOpenChange(false)}
      />
    </UserActionFormDialog>
  )
}

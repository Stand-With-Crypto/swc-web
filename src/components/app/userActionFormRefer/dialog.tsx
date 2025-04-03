'use client'

import { useMemo } from 'react'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { getUserActionFormRefer } from '@/components/app/userActionFormRefer'
import { ANALYTICS_NAME_USER_ACTION_FORM_REFER } from '@/components/app/userActionFormRefer/common/constants'
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

  const UserActionFormRefer = useMemo(() => getUserActionFormRefer(props), [props])

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

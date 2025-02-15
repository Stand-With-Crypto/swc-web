'use client'

import dynamic from 'next/dynamic'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { ANALYTICS_NAME_USER_ACTION_FORM_REFER } from '@/components/app/userActionFormRefer/constants'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useDialog } from '@/hooks/useDialog'

const UserActionFormRefer = dynamic(
  () => import('@/components/app/userActionFormRefer').then(mod => mod.UserActionFormRefer),
  {
    loading: () => (
      <div className="min-h-[400px]">
        <LoadingOverlay />
      </div>
    ),
  },
)

interface UserActionFormReferDialogProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function UserActionFormReferDialog({
  children,
  defaultOpen = false,
}: UserActionFormReferDialogProps) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_REFER,
  })

  return (
    <UserActionFormDialog {...dialogProps} className="max-w-xl" trigger={children}>
      <UserActionFormRefer />
    </UserActionFormDialog>
  )
}

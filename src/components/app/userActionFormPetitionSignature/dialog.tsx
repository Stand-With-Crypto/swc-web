'use client'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { UserActionFormPetitionSignature } from '@/components/app/userActionFormPetitionSignature'
import { useDialog } from '@/hooks/useDialog'
import { cn } from '@/utils/web/cn'

export function UserActionFormPetitionSignatureDialog({
  children,
  defaultOpen = false,
  className,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: 'User Action Form Petition Signature',
  })

  return (
    <UserActionFormDialog {...dialogProps} className={cn('!p-0', className)} trigger={children}>
      <UserActionFormPetitionSignature />
    </UserActionFormDialog>
  )
}

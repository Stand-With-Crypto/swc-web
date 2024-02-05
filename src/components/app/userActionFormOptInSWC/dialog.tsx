'use client'

import { AccountAuthDialogWrapper } from '@/components/app/accountAuth'

export function UserActionFormOptInSWCDialog({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  return <AccountAuthDialogWrapper defaultOpen={defaultOpen}>{children}</AccountAuthDialogWrapper>
}

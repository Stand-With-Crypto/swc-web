'use client'

import React from 'react'

import { useDialog } from '@/hooks/useDialog'

import { AccountAuth } from './accountAuth'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

interface AccountAuthDialogWrapperProps extends React.PropsWithChildren {
  defaultOpen?: boolean
}

export function AccountAuthDialogWrapper({
  children,
  defaultOpen = false,
}: AccountAuthDialogWrapperProps) {
  const dialog = useDialog({ analytics: 'Account Auth', initialOpen: defaultOpen })

  return (
    <Dialog {...dialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <AccountAuth onClose={() => dialog.onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

'use client'

import React from 'react'

import { useDialog } from '@/hooks/useDialog'

import { AccountAuth } from './accountAuth'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

export function AccountAuthDialogWrapper({ children }: React.PropsWithChildren) {
  const dialog = useDialog({ analytics: 'Account Auth' })

  return (
    <Dialog analytics={''} {...dialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <AccountAuth onClose={() => dialog.onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

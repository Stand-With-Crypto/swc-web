'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { useDialog } from '@/hooks/useDialog'

import { AccountAuth } from './accountAuth'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

export const AccountAuthButton: typeof Button = React.forwardRef((props, ref) => {
  const dialog = useDialog(false)

  return (
    <Dialog {...dialog}>
      <DialogTrigger asChild>
        <Button ref={ref} {...props} />
      </DialogTrigger>
      <DialogContent>
        <AccountAuth onClose={() => dialog.onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
})
AccountAuthButton.displayName = 'AccountAuthButton'

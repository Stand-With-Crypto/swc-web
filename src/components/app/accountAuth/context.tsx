'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { useResponsiveDialog } from '@/components/ui/responsiveDialog'
import { useDialog } from '@/hooks/useDialog'

import { AccountAuth } from './accountAuth'

interface AccountAuthContextValue {
  openAccountAuthModal: () => void
  closeAccountAuthModal: () => void
}

const AccountAuthContext = React.createContext<AccountAuthContextValue>({
  openAccountAuthModal: () => {},
  closeAccountAuthModal: () => {},
})

export function AccountAuthContextProvider({ children }: React.PropsWithChildren) {
  const dialog = useDialog(false)
  const { Dialog, DialogContent } = useResponsiveDialog()

  return (
    <AccountAuthContext.Provider
      value={{
        openAccountAuthModal: () => dialog.onOpenChange(true),
        closeAccountAuthModal: () => dialog.onOpenChange(false),
      }}
    >
      <Dialog {...dialog}>
        <DialogContent>
          <AccountAuth onClose={() => dialog.onOpenChange(false)} />
        </DialogContent>
      </Dialog>

      {children}
    </AccountAuthContext.Provider>
  )
}

export function useAccountAuthContext() {
  const ctx = React.useContext(AccountAuthContext)

  if (!ctx) {
    throw new Error('useAccountAuthContext must be used within AccountAuthContextProvider')
  }

  return ctx
}

export const AccountAuthButton: typeof Button = React.forwardRef(({ onClick, ...props }, ref) => {
  const dialog = useDialog(false)
  const { Dialog, DialogContent, DialogTrigger } = useResponsiveDialog()

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

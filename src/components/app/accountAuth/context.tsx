'use client'

import { AccountAuth } from '.'
import { Button } from '@/components/ui/button'
import { useResponsiveDialog } from '@/components/ui/responsiveDialog'
import { useDialog } from '@/hooks/useDialog'
import React from 'react'

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
          <AccountAuth />
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
  const { openAccountAuthModal } = useAccountAuthContext()

  return (
    <Button
      ref={ref}
      {...props}
      onClick={e => {
        onClick?.(e)
        openAccountAuthModal()
      }}
    />
  )
})
AccountAuthButton.displayName = 'AccountAuthButton'

'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useDialog } from '@/hooks/useDialog'
import React from 'react'

interface AccountAuthContextValue {
  openAccountAuthModal: () => void
}

const AccountAuthContext = React.createContext<AccountAuthContextValue>({
  openAccountAuthModal: () => {},
})

export function AccountAuthContextProvider({ children }: React.PropsWithChildren) {
  const dialog = useDialog(false)

  return (
    <AccountAuthContext.Provider
      value={{
        openAccountAuthModal: () => dialog.onOpenChange(true),
      }}
    >
      <Dialog {...dialog}>
        <DialogContent>
          <h1>Hello World</h1>
        </DialogContent>
      </Dialog>

      {children}
    </AccountAuthContext.Provider>
  )
}

export const AccountAuthButton: typeof Button = React.forwardRef(({ onClick, ...props }, ref) => {
  const { openAccountAuthModal } = React.useContext(AccountAuthContext)

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

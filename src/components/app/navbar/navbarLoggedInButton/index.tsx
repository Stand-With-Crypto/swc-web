'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useResponsivePopover } from '@/components/ui/responsivePopover'
import { useDialog } from '@/hooks/useDialog'
import { useUserWithMaybeENSData } from '@/hooks/useUserWithMaybeEnsData'
import { getSensitiveDataUserDisplayName } from '@/utils/web/userUtils'

import { NavbarLoggedInPopoverContent } from './navbarLoggedInPopoverContent'

export function NavbarLoggedInButton({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const { Popover, PopoverContent, PopoverTrigger } = useResponsivePopover()
  const dialogProps = useDialog({ analytics: 'Navbar Logged In Button' })
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const userWithMaybeEnsData = useUserWithMaybeENSData()
  const displayName = userWithMaybeEnsData
    ? getSensitiveDataUserDisplayName(userWithMaybeEnsData)
    : null

  useEffect(() => {
    const handleLogoutEvent = () => {
      setIsLoggingOut(oldState => !oldState)
    }

    document.addEventListener('logoutAction', handleLogoutEvent)

    return () => {
      document.removeEventListener('logoutAction', handleLogoutEvent)
    }
  }, [])

  return (
    <Popover
      {...dialogProps}
      onOpenChange={open => {
        if (!displayName) {
          return
        }
        dialogProps.onOpenChange(open)
        onOpenChange?.(open)
      }}
    >
      <PopoverTrigger asChild disabled={isLoggingOut}>
        {isLoggingOut ? (
          <Button disabled>Logging out...</Button>
        ) : displayName ? (
          <Button>
            <div className="max-w-[150px] truncate">{displayName}</div>
          </Button>
        ) : (
          <Button>Sign In</Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0">
        <NavbarLoggedInPopoverContent onClose={() => dialogProps.onOpenChange(false)} />
      </PopoverContent>
    </Popover>
  )
}

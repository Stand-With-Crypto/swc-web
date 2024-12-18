'use client'

import { useCallback, useMemo, useState } from 'react'
import { useEvent } from 'react-use'

import { Button } from '@/components/ui/button'
import { useResponsivePopover } from '@/components/ui/responsivePopover'
import { useDialog } from '@/hooks/useDialog'
import { useUserWithMaybeENSData } from '@/hooks/useUserWithMaybeEnsData'
import { LOGOUT_ACTION_EVENT } from '@/utils/shared/eventListeners'
import { getSensitiveDataUserDisplayName } from '@/utils/web/userUtils'

import { NavbarLoggedInPopoverContent } from './navbarLoggedInPopoverContent'

export function NavbarLoggedInButton({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const { Popover, PopoverContent, PopoverTrigger } = useResponsivePopover()
  const dialogProps = useDialog({ analytics: 'Navbar Logged In Button' })
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const userWithMaybeEnsData = useUserWithMaybeENSData()

  const displayName = useMemo(() => {
    if (!userWithMaybeEnsData) return null

    const hasUserProvidedInfo =
      userWithMaybeEnsData.firstName || userWithMaybeEnsData.primaryUserEmailAddress?.emailAddress
    if (!hasUserProvidedInfo) {
      return 'Profile'
    }

    return getSensitiveDataUserDisplayName(userWithMaybeEnsData)
  }, [userWithMaybeEnsData])

  const handleLogoutEvent = useCallback(() => {
    setIsLoggingOut(oldState => !oldState)
  }, [])

  // This is used to disable the login button while logging out
  useEvent(LOGOUT_ACTION_EVENT, handleLogoutEvent, window, { capture: true })

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
          <Button data-testid="login-button">
            <div className="max-w-[150px] truncate">{displayName}</div>
          </Button>
        ) : (
          <Button data-testid="login-button">Sign In</Button>
        )}
      </PopoverTrigger>
      <PopoverContent a11yTitle="User Profile" align="end" className="p-0">
        <NavbarLoggedInPopoverContent onClose={() => dialogProps.onOpenChange(false)} />
      </PopoverContent>
    </Popover>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { useResponsivePopover } from '@/components/ui/responsivePopover'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { useUserWithMaybeENSData } from '@/hooks/useUserWithMaybeEnsData'
import { getSensitiveDataUserDisplayName } from '@/utils/web/userUtils'

import { NavbarLoggedInPopoverContent } from './navbarLoggedInPopoverContent'

export function NavbarLoggedInButton({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const { Popover, PopoverContent, PopoverTrigger } = useResponsivePopover()
  const dialogProps = useDialog({ analytics: 'Navbar Logged In Button' })
  const { data } = useApiResponseForUserFullProfileInfo()
  const user = data?.user

  const userWithMaybeEnsData = useUserWithMaybeENSData({ user: data?.user })
  const displayName = userWithMaybeEnsData
    ? getSensitiveDataUserDisplayName(userWithMaybeEnsData)
    : null

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
      <PopoverTrigger asChild>
        {displayName ? (
          <Button variant="secondary">
            <div className="max-w-[150px] truncate">{displayName}</div>
          </Button>
        ) : (
          <Button>Sign In</Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0">
        <NavbarLoggedInPopoverContent onClose={() => dialogProps.onOpenChange(false)} user={user} />
      </PopoverContent>
    </Popover>
  )
}

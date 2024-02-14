'use client'

import { useENS } from '@thirdweb-dev/react'

import { Button } from '@/components/ui/button'
import { useResponsivePopover } from '@/components/ui/responsivePopover'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { appendENSHookDataToUser } from '@/utils/web/appendENSHookDataToUser'
import { getSensitiveDataUserDisplayName } from '@/utils/web/userUtils'

import { NavbarLoggedInPopoverContent } from './navbarLoggedInPopoverContent'

export function NavbarLoggedInButton({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const { Popover, PopoverContent, PopoverTrigger } = useResponsivePopover()
  const dialogProps = useDialog({ analytics: 'Navbar Logged In Button' })
  const ensData = useENS()
  const { data } = useApiResponseForUserFullProfileInfo()
  const user = data?.user
  return (
    <Popover
      {...dialogProps}
      onOpenChange={open => {
        dialogProps.onOpenChange(open)
        onOpenChange?.(open)
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="secondary">
          {user && !ensData.isLoading ? (
            getSensitiveDataUserDisplayName(appendENSHookDataToUser(user, ensData.data))
          ) : (
            // we don't want to show any jank from the default "Log In" state until our auth data is fully loaded
            // this ensures theres a single state change from "Log In" to the user's name
            <>Log In</>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0">
        <NavbarLoggedInPopoverContent onClose={() => dialogProps.onOpenChange(false)} user={user} />
      </PopoverContent>
    </Popover>
  )
}

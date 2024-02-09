'use client'

import React from 'react'
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
        <Button className="min-w-24" variant="secondary">
          <div>
            {user &&
              !ensData.isFetching &&
              getSensitiveDataUserDisplayName(appendENSHookDataToUser(user, ensData.data))}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0">
        <NavbarLoggedInPopoverContent onClose={() => dialogProps.onOpenChange(false)} user={user} />
      </PopoverContent>
    </Popover>
  )
}

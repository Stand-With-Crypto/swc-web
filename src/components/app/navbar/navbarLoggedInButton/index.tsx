'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { NavbarLoggedInPopoverContent } from './navbarLoggedInPopoverContent'
import { useResponsivePopover } from '@/components/ui/responsivePopover'
import { getSensitiveDataUserDisplayName } from '@/utils/web/userUtils'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { useENS } from '@thirdweb-dev/react'
import { appendENSHookDataToUser } from '@/utils/web/appendENSHookDataToUser'

export function NavbarLoggedInButton() {
  const { Popover, PopoverContent, PopoverTrigger } = useResponsivePopover()
  const dialogProps = useDialog({ analytics: 'Navbar Logged In Button' })
  const ensData = useENS()
  const { data } = useApiResponseForUserFullProfileInfo()
  const user = data?.user

  return (
    <Popover {...dialogProps}>
      <PopoverTrigger asChild>
        <Button variant="secondary" className="min-w-24">
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

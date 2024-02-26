'use client'

import React from 'react'
import { UserInformationVisibility } from '@prisma/client'
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

  const displayName = React.useMemo(() => {
    const shouldWaitForEnsData =
      user?.informationVisibility === UserInformationVisibility.CRYPTO_INFO_ONLY

    if (!user) {
      return
    }

    if (shouldWaitForEnsData && ensData.isLoading) {
      return
    }

    return getSensitiveDataUserDisplayName(
      appendENSHookDataToUser(user, shouldWaitForEnsData ? ensData.data : null),
    )
  }, [ensData.data, ensData.isLoading, user])

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
          <div className="max-w-[150px] truncate">{displayName ?? <>Log In</>}</div>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0">
        <NavbarLoggedInPopoverContent onClose={() => dialogProps.onOpenChange(false)} user={user} />
      </PopoverContent>
    </Popover>
  )
}

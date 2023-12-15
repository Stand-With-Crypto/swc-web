'use client'

import { AuthProviders } from '@/components/app/authProviders'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useAddress, useAuth, useLogin, useLogout, useMetamask, useUser } from '@thirdweb-dev/react'
import { ConnectWallet } from '@thirdweb-dev/react'

export function NavbarSessionButtonClient() {
  const { logout } = useLogout()
  const { user, isLoggedIn, isLoading } = useUser()

  if (isLoading) {
    return (
      <Button>
        <Skeleton className="h-[24px] w-[56px]" />
      </Button>
    )
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>User: {`${user.address.slice(0, 10)}...`}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <a
                href="#"
                onClick={() => logout()}
                className={'block w-full px-4 py-2 text-sm text-gray-700'}
              >
                Log Out
              </a>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  // TODO customize
  return <ConnectWallet />
}

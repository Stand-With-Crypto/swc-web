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
import { useAddress, useAuth, useMetamask } from '@thirdweb-dev/react'
import { signIn, signOut, useSession } from 'next-auth/react'

function _NavbarSessionButtonClient() {
  const address = useAddress()
  const connect = useMetamask()
  const auth = useAuth()
  const { data: session, status } = useSession()
  if (status === 'loading') {
    return (
      <Button>
        <Skeleton className="h-[24px] w-[56px]" />
      </Button>
    )
  }
  async function loginWithWallet() {
    const payload = await auth?.login()
    await signIn('credentials', {
      payload: JSON.stringify(payload),
      redirect: false,
    }).then(x => console.log(x))
  }

  if (session?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            User:{' '}
            {`${(session.user.username || session.user.email || session.user.address || '').slice(
              0,
              10,
            )}...`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <a
                href="#"
                onClick={() => signOut({ redirect: true })}
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

  if (address) {
    return <Button onClick={() => loginWithWallet()}>Login</Button>
  }
  // TODO don't offer to connect if the user doesn't have a wallet to connect
  return <Button onClick={() => connect()}>Connect</Button>
}

export function NavbarSessionButtonClient() {
  return (
    <AuthProviders>
      <_NavbarSessionButtonClient />
    </AuthProviders>
  )
}

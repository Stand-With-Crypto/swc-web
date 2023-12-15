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
import { cn } from '@/utils/web/cn'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useAuth, useAddress, useMetamask } from '@thirdweb-dev/react'

function _NavbarSessionButtonClient() {
  const address = useAddress()
  const connect = useMetamask()
  const auth = useAuth()
  const { data: session, status } = useSession()
  if (status === 'loading') {
    return null
  }
  async function loginWithWallet() {
    // Prompt the user to sign a login with wallet message
    const payload = await auth?.login()

    // Then send the payload to next auth as login credentials
    // using the "credentials" provider method
    await signIn('credentials', {
      payload: JSON.stringify(payload),
      redirect: false,
    })
  }

  if (session?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="text-link inline-flex w-full justify-center gap-x-1.5 rounded-md bg-transparent py-2 pl-3 pr-0 text-sm font-semibold ring-inset ring-gray-300 hover:ring-1">
            {session.user.name}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <a
                href="#"
                onClick={() => signOut()}
                className={cn('text-gray-700', 'block px-4 py-2 text-sm')}
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
    return (
      <Button className="pr-0" size="sm" variant="link" onClick={() => loginWithWallet()}>
        Login
      </Button>
    )
  }

  return (
    <Button className="pr-0" size="sm" variant="link" onClick={() => connect()}>
      Connect
    </Button>
  )
}

export function NavbarSessionButtonClient() {
  return (
    <AuthProviders>
      <_NavbarSessionButtonClient />
    </AuthProviders>
  )
}

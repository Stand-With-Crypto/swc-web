'use client'
import { useLogin } from '@thirdweb-dev/react'

import { useThirdwebData } from '@/hooks/useThirdwebData'
import { Skeleton } from '@/components/ui/skeleton'
import { AccountAuthDialogWrapper } from '@/components/app/accountAuth'

import { NavbarLoggedInSessionButton } from './navbarLoggedInSessionButton'
import { Button } from '@/components/ui/button'

export function NavbarSessionButtonClient() {
  const { session } = useThirdwebData()
  const { isLoading: isLoggingIn } = useLogin()

  if (session.isLoading || isLoggingIn) {
    return <Skeleton className="min-w-24 rounded-full" />
  }

  if (session.isLoggedIn) {
    return <NavbarLoggedInSessionButton />
  }

  return (
    <AccountAuthDialogWrapper>
      <Button variant="secondary">Log in</Button>
    </AccountAuthDialogWrapper>
  )
}

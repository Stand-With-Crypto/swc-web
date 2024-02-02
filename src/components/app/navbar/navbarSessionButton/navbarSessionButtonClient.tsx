'use client'
import { useLogin } from '@thirdweb-dev/react'

import { GetDefineMessageResults } from '@/types'
import { useThirdwebData } from '@/hooks/useThirdwebData'
import { Skeleton } from '@/components/ui/skeleton'
import { AccountAuthDialogWrapper } from '@/components/app/accountAuth'

import { NavbarLoggedInSessionButton } from './navbarLoggedInSessionButton'
import { navbarSessionButtonMessages } from './navbarSessionButtonClient.messages'
import { Button } from '@/components/ui/button'

interface NavbarSessionButtonProps {
  messages: GetDefineMessageResults<typeof navbarSessionButtonMessages>
}

export function NavbarSessionButtonClient(_props: NavbarSessionButtonProps) {
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

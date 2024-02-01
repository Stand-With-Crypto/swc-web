'use client'

import { useRouter } from 'next/navigation'
import { ConnectWallet, useAddress, useLogin } from '@thirdweb-dev/react'

import { GetDefineMessageResults } from '@/types'
import { cn } from '@/utils/web/cn'
import { useThirdwebData } from '@/hooks/useThirdwebData'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AccountAuthButton } from '@/components/app/accountAuth/context'

import { NavbarLoggedInSessionButton } from './navbarLoggedInSessionButton'
import { navbarSessionButtonMessages } from './navbarSessionButtonClient.messages'

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

  return <AccountAuthButton variant="secondary">Log in</AccountAuthButton>
}

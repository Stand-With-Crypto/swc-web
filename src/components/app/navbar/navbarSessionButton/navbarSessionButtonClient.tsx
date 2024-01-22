'use client'

import { useThirdwebData } from '@/hooks/useThirdwebData'
import { UnauthenticatedSessionButton } from '@/components/app/unauthenticatedSessionButton'

import { NavbarLoggedInSessionButton } from './navbarLoggedInSessionButton'

export function NavbarSessionButtonClient() {
  const { session } = useThirdwebData()

  if (session.isLoggedIn) {
    return <NavbarLoggedInSessionButton />
  }

  return <UnauthenticatedSessionButton />
}

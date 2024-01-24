'use client'

import { useRouter } from 'next/navigation'
import { ConnectWallet, useAddress, useLogin } from '@thirdweb-dev/react'

import { GetDefineMessageResults } from '@/types'
import { cn } from '@/utils/web/cn'
import { useThirdwebData } from '@/hooks/useThirdwebData'

import { NavbarLoggedInSessionButton } from './navbarLoggedInSessionButton'
import { navbarSessionButtonMessages } from './navbarSessionButtonClient.messages'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface NavbarSessionButtonProps {
  messages: GetDefineMessageResults<typeof navbarSessionButtonMessages>
}

export function NavbarSessionButtonClient(_props: NavbarSessionButtonProps) {
  const router = useRouter()

  const { session } = useThirdwebData()
  const address = useAddress()
  const { login } = useLogin()

  const handleLoginSuccess = () => {
    // ensure that any server components on the page that's being used are refreshed with the context the user is now logged in
    router.refresh()
  }

  if (session.isLoading) {
    return <Skeleton className="min-w-24 rounded-full" />
  }

  if (session.isLoggedIn) {
    return <NavbarLoggedInSessionButton />
  }

  // There are some cases where the wallet is connected but the user is not logged in.
  // If we let ConnectWallet handle this, it shows a different button with an icon and the text "Sign in"
  // that we don't have control over
  if (address) {
    return (
      <Button
        variant="secondary"
        className="min-w-24"
        onClick={() => {
          login().then(handleLoginSuccess)
        }}
      >
        Log in
      </Button>
    )
  }

  return (
    <ConnectWallet
      theme="light"
      modalSize="compact"
      btnTitle="Log in"
      auth={{
        loginOptional: false,
        onLogin: handleLoginSuccess,
      }}
      className={
        /*
          This is a super hacky way of ensuring our button styles override the default styles of the ConnectWallet.
          I copy pasted the button classes and then added !important to each of them https://tailwindcss.com/docs/configuration#important-modifier.
          We'll need to re-update these styles when we modify the actual button component's styles
          Excited for someone to come up with a more elegant approach.
        */
        cn(
          // copy pasted main button code
          '!inline-flex !items-center !justify-center !whitespace-nowrap !rounded-full !text-sm !font-medium !ring-offset-background !transition-colors focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!pointer-events-none disabled:!opacity-50',
          // copy pasted secondary variant code
          '!bg-secondary !text-secondary-foreground hover:!bg-secondary/80',
          // copy pasted default size code
          '!h-10 !px-4 !py-2',
        )
      }
      // the library puts a inline min-width: 140px on the button, so this is the only way to take priority over that
      style={{ minWidth: '96px' }}
    />
  )
}

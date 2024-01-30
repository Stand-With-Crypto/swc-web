import React from 'react'
import { ConnectEmbedProps, useConnectionStatus, useWalletContext } from '@thirdweb-dev/react'
import { useAccountAuthContext } from '@/components/app/accountAuth/context'

import { useScreen, ReservedScreens } from './screen'
import { useSignInRequired } from './useSignInRequired'
import { AccountAuthContent } from './content'
import { useRouter } from 'next/navigation'

export function AccountAuth({
  loginOptional = false,
  ...props
}: ConnectEmbedProps & { loginOptional?: boolean }) {
  const router = useRouter()

  const connectionStatus = useConnectionStatus()
  const { isAutoConnecting } = useWalletContext()
  const { screen, setScreen, initialScreen } = useScreen()
  const requiresSignIn = useSignInRequired(loginOptional)
  const { closeAccountAuthModal } = useAccountAuthContext()

  React.useEffect(() => {
    if (requiresSignIn && screen === ReservedScreens.MAIN) {
      setScreen(ReservedScreens.SIGN_IN)
    }
  }, [requiresSignIn, screen, setScreen])

  const handleClose = React.useCallback(() => {
    closeAccountAuthModal()
    router.refresh()
  }, [closeAccountAuthModal, router])

  if (isAutoConnecting || connectionStatus === 'unknown') {
    console.log({ isAutoConnecting, connectionStatus })
    // TODO: add loading state
    return null
  }

  return (
    <AccountAuthContent
      {...props}
      initialScreen={initialScreen}
      screen={screen}
      setScreen={setScreen}
      isOpen={true}
      onClose={handleClose}
    />
  )
}

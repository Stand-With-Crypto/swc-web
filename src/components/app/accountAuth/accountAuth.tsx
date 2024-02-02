import React from 'react'
import { useRouter } from 'next/navigation'
import { ConnectEmbedProps, useConnectionStatus, useWalletContext } from '@thirdweb-dev/react'

import { useScreen, ReservedScreens } from './screen'
import { useSignInRequired } from './useSignInRequired'
import { AccountAuthContent } from './content'

export function AccountAuth({ onClose, ...props }: ConnectEmbedProps & { onClose: () => void }) {
  const router = useRouter()

  const connectionStatus = useConnectionStatus()
  const { isAutoConnecting } = useWalletContext()
  const { screen, setScreen, initialScreen } = useScreen()
  const requiresSignIn = useSignInRequired()
  React.useEffect(() => {
    if (requiresSignIn && screen === ReservedScreens.MAIN) {
      setScreen(ReservedScreens.SIGN_IN)
    }
  }, [requiresSignIn, screen, setScreen])

  const handleClose = React.useCallback(() => {
    onClose()
    router.refresh()
  }, [onClose, router])

  if (isAutoConnecting || connectionStatus === 'unknown') {
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

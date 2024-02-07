'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ConnectEmbedProps, useConnectionStatus, useWalletContext } from '@thirdweb-dev/react'

import { useScreen, ReservedScreens } from './screen'
import { useSignInRequired } from './useSignInRequired'
import { AccountAuthContent } from './content'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { noop } from 'lodash'

export function AccountAuth({
  onClose,
  isLoading = false,
  ...props
}: ConnectEmbedProps & { onClose: () => void; isLoading?: boolean }) {
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

  const accountAuthContentProps = {
    ...props,
    initialScreen: initialScreen,
    screen: screen,
    setScreen: setScreen,
    isOpen: true,
    onClose: handleClose,
  }

  if (isAutoConnecting || connectionStatus === 'unknown' || isLoading) {
    return (
      <>
        <LoadingOverlay />
        <AccountAuthContent
          {...accountAuthContentProps}
          screen={initialScreen}
          setScreen={noop}
          onClose={handleClose}
          disabled
        />
      </>
    )
  }

  return <AccountAuthContent {...accountAuthContentProps} />
}

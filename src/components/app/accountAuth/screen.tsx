'use client'

import { WalletConfig, useWallet, useWallets } from '@thirdweb-dev/react-core'
import { useState, useEffect, useRef } from 'react'

export enum ReservedScreens {
  MAIN = 'main',
  GET_STARTED = 'getStarted',
  SIGN_IN = 'signIn',
  OTP_EMAIL_CONFIRMATION = 'OTPEmailConfirmation',
}

type Screen = string | WalletConfig

export function useScreen() {
  const walletConfigs = useWallets()
  const initialScreen =
    (walletConfigs.length === 1 && !walletConfigs[0]?.selectUI
      ? walletConfigs[0]
      : ReservedScreens.MAIN) || ReservedScreens.MAIN

  const [screen, setScreen] = useState<Screen>(initialScreen)
  const prevInitialScreen = useRef(initialScreen)
  const wallet = useWallet()

  // when the initial screen changes, reset the screen to the initial screen ( if the modal is closed )
  // This hook comes from thirdweb, there's a possibility that this useEffect is dead code
  // but we left it here in case there is a use case for it
  useEffect(() => {
    if (initialScreen !== prevInitialScreen.current) {
      prevInitialScreen.current = initialScreen
      setScreen(initialScreen)
    }
  }, [initialScreen])

  // if on signature screen and suddenly the wallet is disconnected, go back to the main screen
  useEffect(() => {
    if (!wallet && screen === ReservedScreens.SIGN_IN) {
      setScreen(ReservedScreens.MAIN)
    }
  }, [wallet, screen])

  return {
    screen,
    setScreen,
    initialScreen,
  }
}

import React from 'react'
import {
  WalletConfig,
  useAddress,
  useConnect,
  useConnectionStatus,
  useDisconnect,
  useEmbeddedWallet,
  useLogin,
  useThirdwebAuthContext,
  useUser,
  useWalletContext,
  useWallets,
} from '@thirdweb-dev/react'
import * as Sentry from '@sentry/react'

import { Noop } from '@/components/ui/noop'
import { NextImage } from '@/components/ui/image'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { FormItem } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useResponsiveDialog } from '@/components/ui/responsiveDialog'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useLoadingCallback } from '@/hooks/useLoadingCallback'

import { ReservedScreens } from './screen'
import { WalletSelectUIProps, WalletConnect } from './walletConnect'
import { GOOGLE_AUTH_LOGO, ACCOUNT_AUTH_CONFIG } from './constants'
import { SignatureScreen } from './signatureScreen'
import { noop } from 'lodash'
import { useRouter } from 'next/navigation'

export function AccountAuthContent(props: {
  screen: string | WalletConfig
  initialScreen: string | WalletConfig
  setScreen: (screen: string | WalletConfig) => void
  isOpen: boolean
  onClose: () => void
}) {
  const { screen, setScreen, initialScreen, onClose } = props

  const [selectionData, setSelectionData] = React.useState()
  const { Dialog, DialogContent, DialogTrigger } = useResponsiveDialog()
  const router = useRouter()

  const { user } = useUser()
  const { login } = useLogin()
  const authConfig = useThirdwebAuthContext()
  const walletConfigs = useWallets()
  const connectionStatus = useConnectionStatus()
  const disconnect = useDisconnect()
  const connect = useConnect()
  const address = useAddress()
  const { setConnectionStatus, setConnectedWallet, createWalletInstance, activeWallet } =
    useWalletContext()
  const { connect: connectEmbeddedWallet, sendVerificationEmail } = useEmbeddedWallet()

  const handleBack = React.useCallback(() => {
    setScreen(initialScreen)
    if (connectionStatus === 'connecting') {
      disconnect()
    }
  }, [setScreen, initialScreen, connectionStatus, disconnect])

  const handleConnected = React.useCallback(() => {
    const requiresSignIn = ACCOUNT_AUTH_CONFIG.loginOptional
      ? false
      : !!authConfig?.authUrl && !user?.address

    if (requiresSignIn) {
      setScreen(ReservedScreens.SIGN_IN)
    } else {
      onClose()
    }
  }, [authConfig?.authUrl, user?.address, setScreen, onClose])

  const handleLoginSuccess = React.useCallback(() => {
    // ensure that any server components on the page that's being used are refreshed with the context the user is now logged in
    router.refresh()
  }, [router])

  const handleSelect = async (wallet: WalletConfig) => {
    if (connectionStatus !== 'disconnected') {
      await disconnect()
    }
    setScreen(wallet)
  }

  const { socialLoginConfig, nonSocialLoginConfigs, previewIcons } = React.useMemo(
    () => ({
      socialLoginConfig: walletConfigs.find(config => config.category === 'socialLogin'),
      nonSocialLoginConfigs: walletConfigs.filter(config => config.category !== 'socialLogin'),
      previewIcons: walletConfigs.slice(0, 2).map(config => config.meta.iconURL),
    }),
    [walletConfigs],
  )

  const [handleLoginWithGoogle, isLoading] = useLoadingCallback(async () => {
    const response = await connectEmbeddedWallet({
      strategy: 'google',
    }).catch(Sentry.captureException)

    console.log('handleLoginWithGoogle', { connectionStatus, response })

    if (connectionStatus === 'connected') {
      await login()
      handleLoginSuccess()
    }
  }, [connectEmbeddedWallet, connectionStatus, handleLoginSuccess, login])

  console.log(isLoading)

  const selectUIProps: WalletSelectUIProps = {
    connect,
    setConnectionStatus,
    setConnectedWallet,
    createWalletInstance,
    connectionStatus: connectionStatus,
  }

  console.log({ screen })

  const getWalletUI = (walletConfig: WalletConfig) => {
    const ConnectUI = walletConfig.connectUI || Noop

    return (
      <ConnectUI
        supportedWallets={walletConfigs}
        theme={ACCOUNT_AUTH_CONFIG.theme}
        goBack={handleBack}
        connected={handleConnected}
        isOpen={props.isOpen}
        show={noop}
        hide={noop}
        walletConfig={walletConfig}
        modalSize={ACCOUNT_AUTH_CONFIG.modalSize}
        selectionData={selectionData}
        connect={(options: any) => connect(walletConfig, options)}
        setConnectionStatus={setConnectionStatus}
        setConnectedWallet={setConnectedWallet}
        createWalletInstance={() => createWalletInstance(walletConfig)}
        connectionStatus={connectionStatus}
        connectedWallet={activeWallet}
        connectedWalletAddress={address}
        setSelectionData={data => {
          setSelectionData(data)
        }}
      />
    )
  }

  const walletConnect = (
    <div className="space-y-4">
      {socialLoginConfig && (
        <Button
          variant="secondary"
          className="flex w-full items-center gap-2"
          size="lg"
          onClick={handleLoginWithGoogle}
        >
          <NextImage src={GOOGLE_AUTH_LOGO} width={24} height={24} alt="" />
          <span>Continue with Google</span>
        </Button>
      )}

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary" className="flex w-full items-center gap-2" size="lg">
            {previewIcons.map(iconUrl => (
              <NextImage key={iconUrl} src={iconUrl} width={24} height={24} alt="" />
            ))}
            <span>Connect a wallet</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          {typeof screen !== 'string' ? (
            getWalletUI(screen)
          ) : (
            <WalletConnect
              walletConfigs={nonSocialLoginConfigs}
              onGetStarted={() => {
                setScreen(ReservedScreens.GET_STARTED)
              }}
              setSelectionData={setSelectionData}
              selectWallet={handleSelect}
              selectUIProps={selectUIProps}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )

  const signatureScreen = <SignatureScreen onDone={onClose} />

  if (screen === ReservedScreens.SIGN_IN) {
    return (
      <>
        {isLoading && <LoadingOverlay />}

        {signatureScreen}
      </>
    )
  }

  return (
    <>
      {isLoading && <LoadingOverlay />}

      <Container>{walletConnect}</Container>
    </>
  )
}

function Container({ children }: React.PropsWithChildren) {
  return (
    <div className="p-6">
      <div className="mx-auto flex max-w-[460px] flex-col items-center gap-8">
        <div className="flex flex-col items-center space-y-6">
          <NextImage
            priority
            width={80}
            height={80}
            src="/logo/shield.svg"
            alt="Stand With Crypto Logo"
          />

          <div className="space-y-4">
            <PageTitle size="sm">Join Stand With Crypto</PageTitle>
            <PageSubTitle size="sm">
              Lawmakers and regulators are threatening the crypto industry. You can fight back and
              ask for sensible rules. Join the Stand with Crypto movement to make your voice heard
              in Washington D.C.
            </PageSubTitle>
          </div>
        </div>

        <div className="w-full space-y-4">
          <FormItem>
            <Label htmlFor="email-input">Email</Label>
            <Input id="email-input" placeholder="Email address" type="email" />
          </FormItem>

          <Button className="w-full" size="lg">
            Continue
          </Button>
        </div>

        <div className="flex w-full items-center gap-2">
          <hr className="flex-1" />
          <span className="text-sm text-muted-foreground">Or</span>
          <hr className="flex-1" />
        </div>

        <div className="w-full">{children}</div>
      </div>
    </div>
  )
}

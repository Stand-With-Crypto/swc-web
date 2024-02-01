import React from 'react'
import {
  WalletConfig,
  useAddress,
  useConnect,
  useConnectionStatus,
  useDisconnect,
  useEmbeddedWallet,
  useThirdwebAuthContext,
  useUser,
  useWalletContext,
  useWallets,
} from '@thirdweb-dev/react'
import * as Sentry from '@sentry/react'
import { noop } from 'lodash'
import { useForm } from 'react-hook-form'
import { object } from 'zod'

import { Noop } from '@/components/ui/noop'
import { NextImage } from '@/components/ui/image'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import {
  Form,
  FormControl,
  FormErrorMessage,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useResponsiveDialog } from '@/components/ui/responsiveDialog'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useLoadingCallback } from '@/hooks/useLoadingCallback'
import { InternalLink } from '@/components/ui/link'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { zodResolver } from '@hookform/resolvers/zod'
import { zodEmailAddress } from '@/validation/fields/zodEmailAddress'

import { ReservedScreens } from './screen'
import { WalletSelectUIProps, WalletConnect } from './walletConnect'
import { GOOGLE_AUTH_LOGO, ACCOUNT_AUTH_CONFIG } from './constants'
import { SignatureScreen } from './signatureScreen'
import { OTPEmailConfirmation } from './emailConfirmation'
import { toast } from 'sonner'
import { toastGenericError } from '@/utils/web/toastUtils'

export function AccountAuthContent(props: {
  screen: string | WalletConfig
  initialScreen: string | WalletConfig
  setScreen: (screen: string | WalletConfig) => void
  isOpen: boolean
  onClose: () => void
}) {
  const { screen, setScreen, initialScreen, onClose } = props

  const [selectionData, setSelectionData] = React.useState()
  const [OTPEmailAddress, setOTPEmailAddress] = React.useState('')
  const { Dialog, DialogContent, DialogTrigger } = useResponsiveDialog()

  const { user } = useUser()
  const authConfig = useThirdwebAuthContext()
  const walletConfigs = useWallets()
  const connectionStatus = useConnectionStatus()
  const disconnect = useDisconnect()
  const connect = useConnect()
  const address = useAddress()
  const { setConnectionStatus, setConnectedWallet, createWalletInstance, activeWallet } =
    useWalletContext()
  const { connect: connectEmbeddedWallet } = useEmbeddedWallet()

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

  const [handleLoginWithGoogle, isConnectingWithGoogle] = useLoadingCallback(async () => {
    await connectEmbeddedWallet({
      strategy: 'google',
    })
      .then(setConnectedWallet)
      .catch(Sentry.captureException)
  }, [connectEmbeddedWallet, setConnectedWallet])

  const getOTPErrorType = React.useCallback((errorMessage: string): 'internal' | 'expiredCode' => {
    if (errorMessage.includes('Your OTP code is invalid or expired')) {
      return 'expiredCode'
    }

    return 'internal'
  }, [])

  const [handleLoginWithOTP, isConnectingWithOTP] = useLoadingCallback(
    async (verificationCode: string) => {
      const wallet = await connectEmbeddedWallet({
        strategy: 'email_verification',
        verificationCode,
        email: OTPEmailAddress,
      }).catch(err => {
        const errorType = getOTPErrorType(err.message)

        if (errorType === 'expiredCode') {
          toast.error('Invalid code', {
            description: 'Your verification code is invalid or expired. Please try again.',
          })
        }

        if (errorType === 'internal') {
          Sentry.captureException(err)
          toastGenericError()
        }
      })

      if (wallet) {
        setConnectedWallet(wallet)
        handleConnected()
      }
    },
    [connectEmbeddedWallet, OTPEmailAddress, getOTPErrorType, setConnectedWallet, handleConnected],
  )

  const selectUIProps: WalletSelectUIProps = {
    connect,
    setConnectionStatus,
    setConnectedWallet,
    createWalletInstance,
    connectionStatus: connectionStatus,
  }

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

  const connectMethods = (
    <>
      <EmailForm
        onSubmit={({ emailAddress }) => {
          setOTPEmailAddress(emailAddress)
          setScreen(ReservedScreens.OTP_EMAIL_CONFIRMATION)
        }}
      />

      <div className="flex w-full items-center gap-2">
        <hr className="flex-1" />
        <span className="text-sm text-muted-foreground">Or</span>
        <hr className="flex-1" />
      </div>

      <div className="w-full">
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
      </div>
    </>
  )

  const signatureScreen = <SignatureScreen onDone={onClose} />

  if (screen === ReservedScreens.OTP_EMAIL_CONFIRMATION && OTPEmailAddress) {
    return (
      <>
        {isConnectingWithOTP && <LoadingOverlay />}

        <OTPEmailConfirmation
          onConfirm={handleLoginWithOTP}
          emailAddress={OTPEmailAddress}
          onBack={() => {
            setScreen(ReservedScreens.MAIN)
            setOTPEmailAddress('')
          }}
        />
      </>
    )
  }

  if (screen === ReservedScreens.SIGN_IN) {
    return (
      <>
        {isConnectingWithGoogle && <LoadingOverlay />}

        {signatureScreen}
      </>
    )
  }

  return (
    <>
      {isConnectingWithGoogle && <LoadingOverlay />}

      <ConnectionMethodsContainer>{connectMethods}</ConnectionMethodsContainer>
    </>
  )
}

function ConnectionMethodsContainer({ children }: React.PropsWithChildren) {
  const urls = useIntlUrls()
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

        {children}

        <p className="text-center text-xs text-muted-foreground">
          By signing up, I understand that Stand With Crypto and its vendors may collect and use my
          Personal Information. To learn more, visit the{' '}
          <InternalLink className="text-blue-600" target="_blank" href={urls.privacyPolicy()}>
            Stand With Crypto Alliance Privacy Policy
          </InternalLink>{' '}
          and{' '}
          <InternalLink className="text-blue-600" target="_blank" href={urls.privacyPolicy()}>
            Quorum Privacy Policy (TODO: Figure out where this link should go)
          </InternalLink>
        </p>
      </div>
    </div>
  )
}

function EmailForm({ onSubmit }: { onSubmit: (data: { emailAddress: string }) => void }) {
  const form = useForm({
    defaultValues: {
      emailAddress: '',
    },
    mode: 'onBlur',
    resolver: zodResolver(
      object({
        emailAddress: zodEmailAddress,
      }),
    ),
  })

  return (
    <Form {...form}>
      <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="w-full space-y-4">
          <FormField
            control={form.control}
            name="emailAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email address" {...field} />
                </FormControl>
                <FormErrorMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" size="lg" type="submit">
            Continue
          </Button>
        </div>
      </form>
    </Form>
  )
}

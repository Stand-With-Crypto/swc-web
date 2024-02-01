import React from 'react'
import {
  WalletInstance,
  useAddress,
  useChainId,
  useDisconnect,
  useLogin,
  useWallet,
  useWalletConfig,
  useWalletContext,
} from '@thirdweb-dev/react'
import { walletIds } from '@thirdweb-dev/wallets'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { ReloadIcon } from '@radix-ui/react-icons'

import { safeChainIdToSlug } from '@/components/app/accountAuth/constants'
import { sleep } from '@/utils/shared/sleep'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { PageTitle } from '@/components/ui/pageTitleText'
import { NextImage } from '@/components/ui/image'
import { Button } from '@/components/ui/button'

import { HeadlessSignIn } from './headlessSignIn'

interface SignatureScreenProps {
  onDone: () => void
}
export type SignatureScreenStatus = 'signing' | 'failed' | 'idle'

export function SignatureScreen({ onDone }: SignatureScreenProps) {
  const walletConfig = useWalletConfig()
  const wallet = useWallet()
  const { login } = useLogin()
  const disconnect = useDisconnect()
  const chainId = useChainId()
  const address = useAddress()
  const router = useRouter()

  const [status, setStatus] = React.useState<SignatureScreenStatus>('idle')
  const [tryId, setTryId] = React.useState(0)

  const isSafeWallet = wallet?.walletId === walletIds.safe

  const safeChainSlug =
    chainId && chainId in safeChainIdToSlug
      ? safeChainIdToSlug[chainId as keyof typeof safeChainIdToSlug]
      : undefined

  const signIn = React.useCallback(async () => {
    try {
      setStatus('signing')
      // This is copied from thirdweb-react, to my understanding this is waiting
      // for the wallet to be connected before trying to sign in
      await sleep(1000)
      await login()
      router.refresh()
      onDone()
    } catch (err) {
      setStatus('failed')
      Sentry.captureException(err)
      console.error('failed to log in', err)
    }
  }, [login, onDone, router])

  const handleRetry = () => {
    signIn()
    setTryId(tryId + 1)
  }

  if (!walletConfig || !wallet) {
    return (
      <div className="min-h-96">
        <LoadingOverlay />
      </div>
    )
  }

  if (walletConfig?.isHeadless) {
    return <HeadlessSignIn signIn={signIn} status={status} />
  }

  return (
    <div className="w-full space-y-12 pb-6 md:pb-0">
      <PageTitle size="sm">Sign in</PageTitle>

      <div className="flex w-full flex-col items-center space-y-12">
        {walletConfig && (
          <div className="relative rounded-full">
            <div className="absolute -z-10 h-full w-full animate-ping-small rounded-full bg-primary" />
            <div className="h-20 w-20 overflow-hidden rounded-full">
              <NextImage
                src={walletConfig.meta.iconURL}
                alt={walletConfig.meta.name}
                width={80}
                height={80}
              />
            </div>
          </div>
        )}
        <div className="w-full max-w-96 fade-in-10">
          {status === 'idle' ? (
            <div className="flex flex-col space-y-3">
              <p className="text-center text-sm text-muted-foreground">
                Please sign the message request in your wallet to continue
              </p>

              <Button onClick={signIn}>Sign in</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  disconnect()
                }}
              >
                Disconnect Wallet
              </Button>
            </div>
          ) : (
            <>
              <div className="w-full space-y-3">
                <PageTitle as="h2" size="sm">
                  {status === 'failed' ? 'Failed to Sign in' : 'Awaiting Confirmation'}
                </PageTitle>

                {status === 'signing' && (
                  <p className="text-center text-sm text-muted-foreground">
                    {isSafeWallet ? (
                      <SafeWalletInstruction />
                    ) : (
                      'Sign the signature request in your wallet'
                    )}
                  </p>
                )}

                {isSafeWallet && status === 'signing' && (
                  <div className="w-full">
                    <Button
                      className="w-full"
                      onClick={() => {
                        window.open(
                          `https://app.safe.global/transactions/queue?safe=${safeChainSlug ?? ''}:${
                            address ?? ''
                          }`,
                          '_blank',
                        )
                      }}
                    >
                      Approve transaction in Safe
                    </Button>
                  </div>
                )}

                {status === 'failed' && (
                  <div className="w-full space-y-3">
                    <Button className="flex w-full items-center gap-2" onClick={handleRetry}>
                      <ReloadIcon width={16} height={16} />
                      Try Again
                    </Button>
                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={() => {
                        disconnect()
                      }}
                    >
                      Disconnect Wallet
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SafeWalletInstruction() {
  const { getWalletConfig } = useWalletContext()
  const wallet = useWallet()
  const personalWallet = wallet?.getPersonalWallet() as WalletInstance | undefined
  const isSafePersonalWalletHeadless = personalWallet && getWalletConfig(personalWallet)?.isHeadless

  return (
    <>
      {isSafePersonalWalletHeadless ? (
        <>Approve transaction in Safe</>
      ) : (
        <>Sign signature request in your wallet & approve transaction in Safe</>
      )}
    </>
  )
}

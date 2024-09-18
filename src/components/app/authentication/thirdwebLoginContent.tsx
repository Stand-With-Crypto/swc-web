'use client'
import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AuthOption } from 'node_modules/thirdweb/dist/types/wallets/types'
import { Arguments, useSWRConfig } from 'swr'
import { signLoginPayload } from 'thirdweb/auth'
import { base } from 'thirdweb/chains'
import { ConnectEmbed, ConnectEmbedProps, useConnect } from 'thirdweb/react'
import { createWallet, createWalletAdapter, generateAccount } from 'thirdweb/wallets'

import { ANALYTICS_NAME_LOGIN } from '@/components/app/authentication/constants'
import { DialogBody, DialogFooterCTA } from '@/components/ui/dialog'
import { NextImage } from '@/components/ui/image'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useThirdwebAuthUser } from '@/hooks/useAuthUser'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { generateThirdwebLoginPayload } from '@/utils/server/thirdweb/getThirdwebLoginPayload'
import { isLoggedIn } from '@/utils/server/thirdweb/isLoggedIn'
import { login } from '@/utils/server/thirdweb/onLogin'
import { onLogout } from '@/utils/server/thirdweb/onLogout'
import { isCypress } from '@/utils/shared/executionEnvironment'
import { thirdwebClient } from '@/utils/shared/thirdwebClient'
import { apiUrls } from '@/utils/shared/urls'
import { trackSectionVisible } from '@/utils/web/clientAnalytics'
import { theme } from '@/utils/web/thirdweb/theme'

export interface ThirdwebLoginContentProps extends Omit<ConnectEmbedProps, 'client'> {
  initialEmailAddress?: string | null
  title?: React.ReactNode
  subtitle?: React.ReactNode
  onLoginCallback?: () => Promise<void> | void
}

const DEFAULT_TITLE = 'Join Stand With Crypto'
const DEFAULT_SUBTITLE =
  'Lawmakers and regulators are threatening the crypto industry. You can fight back and ask for sensible rules. Join the Stand With Crypto movement to make your voice heard in Washington D.C.'

const appMetadata = {
  name: 'Stand With Crypto',
  url: 'https://www.standwithcrypto.org/',
  description:
    'Stand With Crypto Alliance is a non-profit organization dedicated to uniting global crypto advocates.',
  logoUrl: 'https://www.standwithcrypto.org/logo/shield.svg',
}

export function ThirdwebLoginContent({
  initialEmailAddress,
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  onLoginCallback,
  ...props
}: ThirdwebLoginContentProps) {
  const urls = useIntlUrls()
  const thirdwebEmbeddedAuthContainer = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const swrConfig = useSWRConfig()

  const handleLogin = useCallback(async () => {
    if (onLoginCallback) {
      await onLoginCallback()
    }

    // ensure that any server components on the page that's being used are refreshed with the context the user is now logged in
    router.refresh()

    // These are keys which the mutation occurs on login
    // If we reset the cache we can have a situation where the value goes from `value => undefined => value`
    const excludedKeysFromCacheReset: Arguments[] = [apiUrls.userFullProfileInfo()]

    // There are a bunch of SWR queries that might show stale unauthenticated data unless we clear the cache.
    // This ensures we refetch using the users authenticated state
    // https://swr.vercel.app/docs/advanced/cache#modify-the-cache-data
    void swrConfig.mutate(arg => !excludedKeysFromCacheReset.includes(arg), undefined, {
      revalidate: true,
    })
  }, [onLoginCallback, router, swrConfig])

  useEffect(() => {
    if (!initialEmailAddress) {
      return
    }

    // const input =
    //   thirdwebEmbeddedAuthContainer.current?.querySelector<HTMLInputElement>('input[type="email"]')
    // if (input && !input.getAttribute('value')) {
    //   input.setAttribute('value', initialEmailAddress)
    // }
  }, [initialEmailAddress])

  return (
    <>
      <DialogBody className="-mt-8">
        <div className="mx-auto flex max-w-[460px] flex-col items-center gap-2">
          <div className="flex flex-col items-center space-y-6 pt-6">
            <NextImage
              alt="Stand With Crypto Logo"
              height={80}
              priority
              src="/logo/shield.svg"
              width={80}
            />

            <div className="space-y-4">
              <PageTitle size="sm">{title}</PageTitle>
              <PageSubTitle size="sm">{subtitle}</PageSubTitle>
            </div>
          </div>

          <div
            className="flex w-full items-center justify-center pb-6"
            ref={thirdwebEmbeddedAuthContainer}
            // if someone enters a super long email, the component will overflow on the "enter confirmation code" screen
            // this prevents that bug
            style={{ maxWidth: 'calc(100vw - 56px)' }}
          >
            <ThirdwebLoginEmbedded onLoginCallback={handleLogin} {...props} />
          </div>
        </div>

        <DialogFooterCTA className="mt-auto px-6 pb-2">
          <p className="text-center text-xs text-muted-foreground">
            <span className="text-[10px]">
              By signing up with your phone number, you consent to receive recurring texts from
              Stand With Crypto. You can reply STOP to stop receiving texts. Message and data rates
              may apply. You understand that Stand With Crypto and its vendors may collect and use
              your Personal Information. To learn more, visit the{' '}
              <InternalLink href={urls.privacyPolicy()} target="_blank">
                Stand With Crypto Alliance Privacy Policy
              </InternalLink>{' '}
              and{' '}
              <ExternalLink href="https://www.quorum.us/privacy-policy/">
                Quorum Privacy Policy
              </ExternalLink>
              .
            </span>
          </p>
        </DialogFooterCTA>
      </DialogBody>
    </>
  )
}

function ThirdwebLoginEmbedded(
  props: Omit<ConnectEmbedProps, 'client'> & {
    onLoginCallback?: () => Promise<void> | void
  },
) {
  const session = useThirdwebAuthUser()
  const hasTracked = useRef(false)
  const { connect } = useConnect()

  useEffect(() => {
    if (!session.isLoggedIn && !hasTracked.current) {
      trackSectionVisible({ sectionGroup: ANALYTICS_NAME_LOGIN, section: 'Login' })
      hasTracked.current = true
    }
  }, [session.isLoggedIn])

  if (session.isLoggedIn) {
    return (
      <div className="h-80">
        <LoadingOverlay />
      </div>
    )
  }
  const embeddedAuthOptions: AuthOption[] = ['google', 'phone', 'email']

  const supportedWallets = [
    createWallet('com.coinbase.wallet', { appMetadata }),
    createWallet('io.metamask'),
    createWallet('walletConnect'),
    createWallet('embedded', { auth: { options: embeddedAuthOptions } }),
  ]

  const recommendedWallets = [createWallet('com.coinbase.wallet')]

  const initializeTestWalletForE2EEnv = async () => {
    const wallet = await connect(async () => {
      const wallet = createWalletAdapter({
        client: thirdwebClient,
        adaptedAccount: await generateAccount({ client: thirdwebClient }),
        chain: base,
        onDisconnect: () => {},
        switchChain: () => {},
      })
      return wallet
    })

    const account = wallet?.getAccount()
    const address = account?.address

    const loginPayload = await generateThirdwebLoginPayload(address!)

    const params = await signLoginPayload({
      payload: loginPayload,
      account: account!,
    })

    await login(params)
    await props.onLoginCallback?.()
  }

  return !isCypress ? (
    <ConnectEmbed
      appMetadata={appMetadata}
      auth={{
        isLoggedIn: () => isLoggedIn(),
        doLogin: async params => {
          await login(params)
          await props.onLoginCallback?.()
        },
        getLoginPayload: async ({ address }) => generateThirdwebLoginPayload(address),
        doLogout: () => onLogout(),
      }}
      chain={base}
      client={thirdwebClient}
      locale="en_US"
      recommendedWallets={recommendedWallets}
      showAllWallets={false}
      showThirdwebBranding={false}
      style={{ border: 'none', maxWidth: 'unset' }}
      theme={theme}
      wallets={supportedWallets}
      {...props}
    />
  ) : (
    <button data-testid="e2e-test-login" onClick={initializeTestWalletForE2EEnv}>
      login
    </button>
  )
}

'use client'
import { useEffect, useRef } from 'react'
import { base } from 'thirdweb/chains'
import { ConnectEmbed, ConnectEmbedProps } from 'thirdweb/react'
import { createWallet } from 'thirdweb/wallets'

import {
  generatePayload,
  isLoggedIn,
  login,
  logout,
} from '@/actions/actionAuthenticateUsingThirdweb'
import { ANALYTICS_NAME_LOGIN } from '@/components/app/authentication/constants'
import { DialogBody, DialogFooterCTA } from '@/components/ui/dialog'
import { NextImage } from '@/components/ui/image'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useThirdwebAuthUser } from '@/hooks/useAuthUser'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { thirdwebClient } from '@/utils/shared/thirdwebClient'
import { trackSectionVisible } from '@/utils/web/clientAnalytics'
import { theme } from '@/utils/web/thirdweb/theme'

export interface ThirdwebLoginContentProps extends Omit<ConnectEmbedProps, 'client'> {
  initialEmailAddress?: string | null
  title?: React.ReactNode
  subtitle?: React.ReactNode
}

const DEFAULT_TITLE = 'Join Stand With Crypto'
const DEFAULT_SUBTITLE =
  'Lawmakers and regulators are threatening the crypto industry. You can fight back and ask for sensible rules. Join the Stand With Crypto movement to make your voice heard in Washington D.C.'

export function ThirdwebLoginContent({
  initialEmailAddress,
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  ...props
}: ThirdwebLoginContentProps) {
  const urls = useIntlUrls()
  const thirdwebEmbeddedAuthContainer = useRef<HTMLDivElement>(null)

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
          <div className="flex flex-col items-center space-y-6">
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
            <ThirdwebLoginEmbedded {...props} />
          </div>
        </div>

        <DialogFooterCTA className="mt-auto pb-2">
          <p className="text-center text-xs text-muted-foreground">
            By signing up, I understand that Stand With Crypto and its vendors may collect and use
            my Personal Information. To learn more, visit the{' '}
            <InternalLink href={urls.privacyPolicy()} target="_blank">
              Stand With Crypto Alliance Privacy Policy
            </InternalLink>{' '}
            and{' '}
            <ExternalLink href="https://www.quorum.us/privacy-policy/">
              Quorum Privacy Policy
            </ExternalLink>
          </p>
        </DialogFooterCTA>
      </DialogBody>
    </>
  )
}

function ThirdwebLoginEmbedded(props: Omit<ConnectEmbedProps, 'client'>) {
  const session = useThirdwebAuthUser()
  const hasTracked = useRef(false)
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
  const supportedWallets = [
    // inAppWallet(), // TODO: migrate to v5( investigate what is this wallet)
    createWallet('com.coinbase.wallet'),
    createWallet('io.metamask'),
    createWallet('walletConnect'),
    createWallet('embedded', { auth: { options: ['google', 'email'] } }),
  ]

  // Used to authenticate cypresses tests
  // if (isCypress) {
  //   supportedWallets.push(localWallet())
  // } TODO: migrate to v5

  const recommendedWallets = [createWallet('com.coinbase.wallet')]

  return (
    <ConnectEmbed
      appMetadata={{
        name: 'Stand With Crypto',
        url: 'https://www.standwithcrypto.org/',
        description:
          'Stand With Crypto Alliance is a non-profit organization dedicated to uniting global crypto advocates.',
        logoUrl: 'https://www.standwithcrypto.org/logo/android-chrome-512x512.png',
      }}
      auth={{
        // WIP: this auth property was copied from the docs. Still need to update it for our needs
        isLoggedIn: async address => {
          console.log('checking if logged in!', { address })
          return await isLoggedIn()
        },
        doLogin: async params => {
          console.log('logging in!')
          await login(params)
        },
        getLoginPayload: async ({ address }) => generatePayload({ address }),
        doLogout: async () => {
          console.log('logging out!')
          await logout()
        },
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
  )
}

// TODO: Remove this after v5 migration complete. The following comment is for reference only
// export const thirdwebAuthConfig: AuthOptions = {
//   domain: NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
//   client: thirdwebClient,
//   adminAccount: privateKeyToAccount({
//     client: thirdwebClient,
//     privateKey: THIRDWEB_AUTH_PRIVATE_KEY,
//   }),
//   jwt: {
//     expirationTimeSeconds: 60 * 60 * 24 * 7, // 1 week
//   },
//   login: {
//     nonce: {
//       validate: async (nonce: string) => {
//         const nonceExists = await prismaClient.authenticationNonce.findUnique({
//           where: { id: nonce },
//         })

//         return !!nonceExists
//       },
//       generate: async () => {
//         // What should I use to generate this nonce?
//         return ''
//       }
//     },
//   },

//   // callbacks: {
//   //   onLogout: async (user, req) => {
//   //     const localUser = parseLocalUserFromCookiesForPageRouter(req)
//   //     const sessionData = user.session as AuthSessionMetadata
//   //     await getServerAnalytics({ userId: sessionData.userId, localUser }).track('User Logged Out')
//   //   },
//   //   // look for the comment in appRouterGetAuthUser for why we don't use this fn
//   //   onUser: async () => {},
//   //   onLogin,
//   // },
// }

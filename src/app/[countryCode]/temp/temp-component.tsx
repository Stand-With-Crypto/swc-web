'use client'

import { AuthOption } from 'node_modules/thirdweb/dist/types/wallets/types'
import { base } from 'thirdweb/chains'
import { ConnectEmbed } from 'thirdweb/react'
import { createWallet } from 'thirdweb/wallets'

import { generateThirdwebLoginPayload } from '@/utils/server/thirdweb/getThirdwebLoginPayload'
import { isLoggedIn } from '@/utils/server/thirdweb/isLoggedIn'
import { login } from '@/utils/server/thirdweb/onLogin'
import { onLogout } from '@/utils/server/thirdweb/onLogout'
import { thirdwebClient } from '@/utils/shared/thirdwebClient'
import { theme } from '@/utils/web/thirdweb/theme'

const appMetadata = {
  name: 'Stand With Crypto',
  url: 'https://www.standwithcrypto.org/',
  description:
    'Stand With Crypto Alliance is a non-profit organization dedicated to uniting global crypto advocates.',
  logoUrl: 'https://www.standwithcrypto.org/logo/shield.svg',
}

export function TempConnectEmbedComponent() {
  const embeddedAuthOptions: AuthOption[] = ['google', 'phone', 'email']

  const supportedWallets = [
    createWallet('com.coinbase.wallet', { appMetadata }),
    createWallet('io.metamask'),
    createWallet('walletConnect'),
    createWallet('embedded', { auth: { options: embeddedAuthOptions } }),
  ]

  const recommendedWallets = [createWallet('com.coinbase.wallet')]

  return (
    <ConnectEmbed
      appMetadata={appMetadata}
      auth={{
        isLoggedIn: async () => await isLoggedIn(),
        doLogin: async params => {
          await login(params)
          console.log('passou do login')
        },
        getLoginPayload: async ({ address }) => generateThirdwebLoginPayload(address),
        doLogout: async () => await onLogout(),
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
    />
  )
}

import * as Sentry from '@sentry/nextjs'

import { THIRD_WEB_CLIENT_SECRET } from '@/utils/server/thirdweb/thirdwebClientSecret'
import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const NEXT_PUBLIC_THIRDWEB_CLIENT_ID = requiredEnv(
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  'process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID',
)

export interface ThirdwebEmbeddedWalletMetadata {
  userId: string
  walletAddress: string
  email?: string
  phone?: string
  createdAt: string
}

/**
 * Fetches the metadata of an embedded wallet from Thirdweb.
 * https://portal.thirdweb.com/connect/in-app-wallet/how-to/get-in-app-wallet-details-on-server
 */
export async function fetchEmbeddedWalletMetadataFromThirdweb(
  cryptoAddress: string,
): Promise<ThirdwebEmbeddedWalletMetadata | null> {
  const url = new URL(
    'https://embedded-wallet.thirdweb.com/api/2023-11-30/embedded-wallet/user-details',
  )
  url.searchParams.set('queryBy', 'walletAddress')
  url.searchParams.set('walletAddress', cryptoAddress)

  const resp = await fetchReq(url.href, {
    headers: {
      /*
      TW API used to always use the client ID associated with the client secret
      We have a use case where we no longer have the old client secret, but we can't update the client id
      without creating new embedded wallets for existing users. This new config they added 
      allows us to use any client secret to query any client id associated with our account
      */
      'x-client-id-override': NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
      Authorization: `Bearer ${THIRD_WEB_CLIENT_SECRET}`,
    },
  }).catch(error => {
    Sentry.captureException(error, {
      extra: { address: cryptoAddress },
      tags: { domain: 'fetchEmbeddedWalletMetadataFromThirdweb' },
    })
    return null
  })

  if (!resp) {
    return null
  }

  const data = (await resp.json()) as ThirdwebEmbeddedWalletMetadata[]
  const metadata = data?.[0]

  return metadata
    ? {
        ...metadata,
        email: metadata?.email ? metadata.email.toLowerCase() : '',
      }
    : null
}

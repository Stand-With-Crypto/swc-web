import * as Sentry from '@sentry/nextjs'

import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const THIRD_WEB_CLIENT_SECRET = requiredEnv(
  process.env.THIRD_WEB_CLIENT_SECRET,
  'process.env.THIRD_WEB_CLIENT_SECRET',
)

export interface ThirdwebEmbeddedWalletMetadata {
  userId: string
  walletAddress: string
  email: string
  createdAt: string
}
/*
This is based of direct conversations with the thirdweb team. It appears to be an undocumented API
This API will only return emails tht have been fully verified by thirdweb
*/
export async function fetchEmbeddedWalletMetadataFromThirdweb(cryptoAddress: string) {
  const url = new URL(
    'https://embedded-wallet.thirdweb.com/api/2023-11-30/embedded-wallet/user-details',
  )
  url.searchParams.set('queryBy', 'walletAddress')
  url.searchParams.set('walletAddress', cryptoAddress)

  const resp = await fetchReq(url.href, {
    headers: {
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
  return data[0] || null
}

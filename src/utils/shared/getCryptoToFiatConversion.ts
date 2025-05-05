import { Decimal } from '@prisma/client/runtime/library'
import * as Sentry from '@sentry/nextjs'

import { fetchReq } from '@/utils/shared/fetchReq'

interface CryptoToFiatConversionResult {
  data: {
    amount: Decimal
    currency: string
  }
}

/**
 * Get the USD price for a crypto asset.
 * @param tickerSymbol
 * @returns CryptoToFiatConversionResult
 */
export async function getCryptoToFiatConversion(tickerSymbol: string) {
  const data = await fetchReq(
    `https://api.coinbase.com/v2/prices/${tickerSymbol.toLowerCase()}-usd/spot`,
  )
    .then(res => res.json())
    .then(data => {
      const unformatted = data as { data: { amount: string; currency: string } }
      const formatted: CryptoToFiatConversionResult = {
        data: { amount: new Decimal(unformatted.data.amount), currency: unformatted.data.currency },
      }
      return formatted
    })
    .catch(error => {
      Sentry.captureException(error, {
        tags: { domain: 'getCryptoToFiatConversion' },
        extra: { response: data },
      })
      return undefined
    })

  return data
}

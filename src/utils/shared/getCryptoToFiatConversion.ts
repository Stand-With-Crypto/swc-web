import { fetchReq } from '@/utils/shared/fetchReq'
import * as Sentry from '@sentry/nextjs'

type CryptoToFiatConversionResult = {
  data: {
    amount: string
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
    .catch(error => {
      Sentry.captureException(error, {
        tags: { domain: 'getCryptoToFiatConversion' },
        extra: { response: data },
      })
      return undefined
    })

  if (!data) {
    return undefined
  }

  return data as CryptoToFiatConversionResult
}

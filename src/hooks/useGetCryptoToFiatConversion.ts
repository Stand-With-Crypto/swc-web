import { fetchReq } from '@/utils/shared/fetchReq'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'
import useSWR from 'swr'

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
    .catch(e => {
      catchUnexpectedServerErrorAndTriggerToast(e)
      return { notFoundReason: 'UNEXPECTED_ERROR' as const }
    })

  if (!data) {
    return { notFoundReason: 'NO_DATA_RETURNED' as const }
  }

  return data as CryptoToFiatConversionResult
}

export type UseGetCryptoToFiatConversionResponse = Awaited<
  ReturnType<typeof getCryptoToFiatConversion>
>

/**
 * Get the USD price for a crypto asset.
 * @param tickerSymbol
 * @returns CryptoToFiatConversionResult
 */
export function useGetCryptoToFiatConversion(tickerSymbol: string) {
  return useSWR<UseGetCryptoToFiatConversionResponse>(
    tickerSymbol ? `useGetCryptoToFiatConversion-${tickerSymbol}` : null,
    () => getCryptoToFiatConversion(tickerSymbol),
  )
}

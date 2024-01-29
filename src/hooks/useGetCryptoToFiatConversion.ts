import { fetchReq } from '@/utils/shared/fetchReq'
import { externalUrls } from '@/utils/shared/urls'
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
 * @returns CryptoFiatConversionResult
 */
export async function getCryptoToFiatConversion(tickerSymbol: string) {
  const data = await fetchReq(externalUrls.coinbaseApi(tickerSymbol))
    .then(res => res.json())
    .catch(e => {
      catchUnexpectedServerErrorAndTriggerToast(e)
      return { notFoundReason: 'UNEXPECTED_ERROR' as const }
    })

  if (!data) {
    return { notFoundReason: 'API_ERROR' as const }
  }

  return data as CryptoToFiatConversionResult
}

export type UseGetCryptoToFiatConversionResponse = Awaited<
  ReturnType<typeof getCryptoToFiatConversion>
>

/**
 * Get the USD price for a crypto asset.
 * @param tickerSymbol
 * @returns CryptoFiatConversionResult
 */
export function useGetCryptoFiatConversion(tickerSymbol: string) {
  return useSWR<UseGetCryptoToFiatConversionResponse>(
    tickerSymbol ? `useGetCryptoFiatConversion-${tickerSymbol}` : null,
    () => getCryptoToFiatConversion(tickerSymbol),
  )
}

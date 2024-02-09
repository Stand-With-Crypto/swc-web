import useSWR from 'swr'

import { getCryptoToFiatConversion } from '@/utils/shared/getCryptoToFiatConversion'

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

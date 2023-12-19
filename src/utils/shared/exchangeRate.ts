import { SupportedCryptoCurrencyCodes } from '@/utils/shared/currency'
import { Decimal } from '@prisma/client/runtime/library'

export const MOCK_CURRENT_ETH_USD_EXCHANGE_RATE = 2111.11

// TODO implement
export async function getCurrentCryptoUsdExchangeRate(
  cryptoCurrencyCode: SupportedCryptoCurrencyCodes,
): Promise<number> {
  switch (cryptoCurrencyCode) {
    case SupportedCryptoCurrencyCodes.ETH:
      return MOCK_CURRENT_ETH_USD_EXCHANGE_RATE
    default:
      throw new Error(`Unsupported crypto currency code: ${cryptoCurrencyCode}`)
  }
}

export async function getCurrentCryptoValueInUsd(
  cryptoCurrencyCode: SupportedCryptoCurrencyCodes,
  amount: Decimal,
) {
  const exchangeRate = await getCurrentCryptoUsdExchangeRate(cryptoCurrencyCode)
  return amount.times(exchangeRate)
}

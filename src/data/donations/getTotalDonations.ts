import { SupportedLocale } from '@/intl/locales'
import { SupportedCurrencyCodes } from '@/utils/shared/currency'
import { getLogger } from '@/utils/shared/logger'
import 'server-only'

const logger = getLogger('getTotalDonations')

export type TotalDonations = {
  amountUsd: number
  amountLocal: number
  currencyCode: SupportedCurrencyCodes
}

export type TotalDonationsConfig = {
  locale: SupportedLocale
}

const mockTotalDonations = async (config: TotalDonationsConfig) => {
  // TODO implement this
  const amountUsd = new Date().getTime() / 10000
  return { amountUsd, amountLocal: amountUsd, currencyCode: SupportedCurrencyCodes.USD }
}

export async function getTotalDonations(config: TotalDonationsConfig): Promise<TotalDonations> {
  return mockTotalDonations(config)
}

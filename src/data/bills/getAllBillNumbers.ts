import 'server-only'

import { getBillsFromBuilderIO } from '@/utils/server/builder/models/data/bills'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export async function getAllBillNumbers(countryCode: SupportedCountryCodes) {
  const bills = await getBillsFromBuilderIO({ countryCode })

  return bills.map(bill => bill.billNumber)
}

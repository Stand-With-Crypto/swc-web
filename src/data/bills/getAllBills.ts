import 'server-only'

import { mergeBillsFromBuilderIOAndDTSI } from '@/data/bills/utils/merge'
import { queryDTSIAllBills } from '@/data/dtsi/queries/queryDTSIAllBills'
import { getBillsFromBuilderIO } from '@/utils/server/builder/models/data/bills'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export async function getAllBills(countryCode: SupportedCountryCodes, stateCode?: string) {
  const [billsFromBuilderIO, billsFromDTSI] = await Promise.allSettled([
    getBillsFromBuilderIO({ countryCode, stateCode }),
    queryDTSIAllBills(),
  ])

  const mergedBills = mergeBillsFromBuilderIOAndDTSI(
    billsFromBuilderIO.status === 'fulfilled' ? billsFromBuilderIO.value : [],
    billsFromDTSI.status === 'fulfilled' ? billsFromDTSI.value : null,
  )

  return mergedBills
}

import 'server-only'

import { DTSI_BillDetails, mergeBillsFromBuilderIOAndDTSI } from '@/data/bills/utils/merge'
import { queryDTSIAllBills } from '@/data/dtsi/queries/queryDTSIAllBills'
import { getBillsFromBuilderIO } from '@/utils/server/builder/models/data/bills'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export async function getAllBills(countryCode: SupportedCountryCodes) {
  const [billsFromBuilderIO, billsFromDTSI] = await Promise.allSettled([
    getBillsFromBuilderIO({ countryCode }),
    queryDTSIAllBills(),
  ])

  const mergedBills = mergeBillsFromBuilderIOAndDTSI(
    billsFromBuilderIO.status === 'fulfilled' ? billsFromBuilderIO.value : [],
    billsFromDTSI.status === 'fulfilled'
      ? (billsFromDTSI.value as unknown as DTSI_BillDetails[])
      : null,
  )

  return mergedBills
}

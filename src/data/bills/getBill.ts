import 'server-only'

import { BillFromDTSI } from '@/data/bills/types'
import { mergeBillFromBuilderIOAndDTSI } from '@/data/bills/utils/merge'
import { queryDTSIBillDetails } from '@/data/dtsi/queries/queryDTSIBillDetails'
import {
  getBillFromBuilderIOByBillNumber,
  getBillFromBuilderIOByDTSISlug,
} from '@/utils/server/builder/models/data/bills'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCBill } from '@/utils/shared/zod/getSWCBills'

export async function getBill(
  countryCode: SupportedCountryCodes,
  billNumberOrDTSISlug: string,
): Promise<SWCBill | null> {
  let billFromBuilderIO = await getBillFromBuilderIOByBillNumber(countryCode, billNumberOrDTSISlug)

  if (!billFromBuilderIO) {
    billFromBuilderIO = await getBillFromBuilderIOByDTSISlug(countryCode, billNumberOrDTSISlug)
  }

  if (!billFromBuilderIO) {
    return null
  }

  let billFromDTSI: BillFromDTSI | null | undefined = null
  if (billFromBuilderIO.dtsiSlug) {
    billFromDTSI = await queryDTSIBillDetails(billFromBuilderIO.dtsiSlug)
  }

  const mergedBill = mergeBillFromBuilderIOAndDTSI(billFromBuilderIO, billFromDTSI)

  return mergedBill
}

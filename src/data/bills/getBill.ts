import 'server-only'

import { BillFromDTSI } from '@/data/bills/types'
import { mergeBillFromBuilderIOAndDTSI } from '@/data/bills/utils/merge'
import { queryDTSIBillDetails } from '@/data/dtsi/queries/queryDTSIBillDetails'
import { getBillFromBuilderIO } from '@/utils/server/builder/models/data/bills'
import { SWCBill } from '@/utils/shared/zod/getSWCBills'

export async function getBill(billNumber: string): Promise<SWCBill | null> {
  const billFromBuilderIO = await getBillFromBuilderIO(billNumber)

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

import { BillCardInfoFromDTSI, BillFromDTSI, SWCBillCardInfo } from '@/data/bills/types'
import { SWCBill } from '@/utils/shared/zod/getSWCBills'

export function mergeBillFromBuilderIOAndDTSI(
  billFromBuilderIO: SWCBill,
  billFromDTSI: BillFromDTSI | null | undefined,
): SWCBill {
  if (!billFromDTSI) {
    return billFromBuilderIO
  }

  return {
    ...billFromBuilderIO,
    analysis:
      billFromBuilderIO.analysis ||
      billFromDTSI.analysis?.reduce(
        (analysis, { richTextCommentary }) => analysis + richTextCommentary,
        '',
      ) ||
      '',
    computedStanceScore: billFromDTSI.computedStanceScore,
    dateIntroduced: billFromBuilderIO.dateIntroduced || billFromDTSI.dateIntroduced,
    dtsiSlug: billFromBuilderIO.dtsiSlug || billFromDTSI.id,
    officialBillUrl: billFromBuilderIO.officialBillUrl || billFromDTSI.congressDotGovUrl,
    relationships: billFromDTSI.relationships,
    summary: billFromBuilderIO.summary || billFromDTSI.summary,
    title: billFromBuilderIO.title || billFromDTSI.shortTitle || billFromDTSI.title,
  }
}

function mergePartialBillFromBuilderIOAndDTSI(
  billFromBuilderIO: SWCBillCardInfo,
  billFromDTSI: BillCardInfoFromDTSI | null | undefined,
): SWCBillCardInfo {
  if (!billFromDTSI) {
    return billFromBuilderIO
  }

  return {
    billNumberOrDTSISlug: billFromBuilderIO.billNumberOrDTSISlug,
    computedStanceScore: billFromDTSI.computedStanceScore,
    dateIntroduced: billFromBuilderIO.dateIntroduced || billFromDTSI.dateIntroduced,
    isKeyBill: billFromBuilderIO.isKeyBill || false,
    title: billFromBuilderIO.title || billFromDTSI.shortTitle || billFromDTSI.title,
  }
}

export function mergeBillsFromBuilderIOAndDTSI(
  billsFromBuilderIO: SWCBill[],
  billsFromDTSI: BillCardInfoFromDTSI[] | null | undefined,
): SWCBillCardInfo[] {
  const bills = billsFromBuilderIO.map(bill => ({
    ...bill,
    billNumberOrDTSISlug: bill.billNumber,
  }))

  if (!billsFromDTSI || billsFromDTSI.length === 0) {
    return bills
  }

  return bills.map(billFromBuilderIO => {
    const billFromDTSI = billsFromDTSI.find(bill => bill.id === billFromBuilderIO.dtsiSlug)

    if (!billFromDTSI) {
      return billFromBuilderIO
    }

    return mergePartialBillFromBuilderIOAndDTSI(billFromBuilderIO, billFromDTSI)
  })
}

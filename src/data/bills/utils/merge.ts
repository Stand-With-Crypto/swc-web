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
    summary: billFromBuilderIO.summary || billFromDTSI.summary,
    title: billFromBuilderIO.title || billFromDTSI.shortTitle || billFromDTSI.title,
  }
}

export function mergeBillsFromBuilderIOAndDTSI(
  billsFromBuilderIO: SWCBill[],
  billsFromDTSI: BillCardInfoFromDTSI[] | null | undefined,
): SWCBillCardInfo[] {
  if (!billsFromDTSI || billsFromDTSI.length === 0) {
    return billsFromBuilderIO
  }

  return billsFromBuilderIO.map(billFromBuilderIO => {
    const billFromDTSI = billsFromDTSI.find(bill => bill.id === billFromBuilderIO.dtsiSlug)

    if (!billFromDTSI) {
      return billFromBuilderIO
    }

    return {
      computedStanceScore: billFromDTSI.computedStanceScore,
      dateIntroduced: billFromBuilderIO.dateIntroduced || billFromDTSI.dateIntroduced,
      isKeyBill: billFromBuilderIO.isKeyBill || false,
      dtsiSlug: billFromBuilderIO.dtsiSlug || billFromDTSI.id,
      title: billFromBuilderIO.title || billFromDTSI.shortTitle || billFromDTSI.title,
    }
  })
}

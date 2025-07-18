import { DTSI_Bill } from '@/data/dtsi/generated'
import { SWCBill } from '@/utils/shared/zod/getSWCBills'

export type DTSI_BillDetails = Pick<
  DTSI_Bill,
  | 'computedStanceScore'
  | 'congressDotGovUrl'
  | 'dateIntroduced'
  | 'id'
  | 'shortTitle'
  | 'status'
  | 'summary'
  | 'title'
> & { analysis: { richTextCommentary: string }[] }

export function mergeBillFromBuilderIOAndDTSI(
  billFromBuilderIO: SWCBill,
  billFromDTSI: DTSI_BillDetails | null | undefined,
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
  billsFromDTSI: DTSI_BillDetails[] | null | undefined,
): SWCBill[] {
  if (!billsFromDTSI || billsFromDTSI.length === 0) {
    return billsFromBuilderIO
  }

  const mergedBills: SWCBill[] = []

  for (const billFromBuilderIO of billsFromBuilderIO) {
    const billFromDTSI = billsFromDTSI.find(bill => bill.id === billFromBuilderIO.dtsiSlug)

    mergedBills.push(mergeBillFromBuilderIOAndDTSI(billFromBuilderIO, billFromDTSI))
  }

  return mergedBills
}

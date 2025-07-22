import { DTSI_Bill, DTSI_BillRelationshipsFragment } from '@/data/dtsi/generated'
import { SWCBill } from '@/utils/shared/zod/getSWCBills'

export type BillFromDTSI = Pick<
  DTSI_Bill,
  | 'computedStanceScore'
  | 'congressDotGovUrl'
  | 'dateIntroduced'
  | 'id'
  | 'shortTitle'
  | 'status'
  | 'summary'
  | 'title'
> & { analysis: { richTextCommentary: unknown }[]; relationships: DTSI_BillRelationshipsFragment[] }

export type BillCardInfoFromDTSI = Pick<
  DTSI_Bill,
  'computedStanceScore' | 'id' | 'shortTitle' | 'title'
>

export type SWCBillCardInfo = Pick<SWCBill, 'billNumber' | 'computedStanceScore' | 'title'>

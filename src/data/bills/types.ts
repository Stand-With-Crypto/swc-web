import { DTSI_Bill } from '@/data/dtsi/generated'
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
> & { analysis: { richTextCommentary: unknown }[] }

export type BillCardInfoFromDTSI = Pick<
  DTSI_Bill,
  'computedStanceScore' | 'id' | 'shortTitle' | 'title'
>

export type SWCBillCardInfo = Pick<SWCBill, 'computedStanceScore' | 'dtsiSlug' | 'title'>

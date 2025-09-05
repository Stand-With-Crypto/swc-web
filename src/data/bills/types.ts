import { DTSI_Bill, DTSI_Person } from '@/data/dtsi/generated'
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
  | 'latestVotes'
  | 'sponsorshipRelationships'
> & { analysis: { richTextCommentary: unknown }[] }

export type BillCardInfoFromDTSI = Pick<
  DTSI_Bill,
  'computedStanceScore' | 'dateIntroduced' | 'id' | 'shortTitle' | 'title'
>

export type SWCBillCardInfo = Pick<
  SWCBill,
  'computedStanceScore' | 'dateIntroduced' | 'isKeyBill' | 'title'
> & {
  billNumberOrDTSISlug: string
}

export type BillDetails = SWCBill & {
  relationships: {
    sponsors: DTSI_Person[]
    coSponsors: DTSI_Person[]
    votedFor: DTSI_Person[]
    votedAgainst: DTSI_Person[]
  }
}

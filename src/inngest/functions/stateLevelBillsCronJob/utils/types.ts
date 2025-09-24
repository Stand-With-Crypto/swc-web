import { SWCBillFromBuilderIO } from '@/utils/shared/zod/getSWCBills'

export type BuilderIOBillPublishedState = 'archived' | 'draft' | 'published'

interface QuorumApiResponseMeta {
  limit: number
  model: string
  next: string | null
  offset: number
  previous: string | null
  total_count: number
  watermark: string
}

interface QuorumBillApiObjectMajorAction {
  acted_at: string // YYYY-MM-DD
  chamber: number
  committees: string
  db_order: number
  general_status: number
  status: number
  text: string
  type: string
  votes: string
}

export interface QuorumBillApiObject {
  bill_type: number
  id: number
  introduced_date: string // YYYY-MM-DD
  label: string
  major_actions: QuorumBillApiObjectMajorAction[]
  most_recent_action_date: string // YYYY-MM-DD
  number: number
  region: number
  source_link: string
  title: string
}

export interface QuorumBillSummaryApiObject {
  bill: `/api/newbill/${number}/`
  content: string
  id: number // summary id
  modified: string // YYYY-MM-DD
  resource_uri: `/api/newbillsummary/${number}/`
}

type QuorumBillApiObjectKey = keyof QuorumBillApiObject

export type QuorumBillApiSortKey = (QuorumBillApiObjectKey | `-${QuorumBillApiObjectKey}`) & {}

export interface QuorumBillApiResponse {
  meta: QuorumApiResponseMeta
  objects: QuorumBillApiObject[]
}

export interface QuorumBillSummaryApiResponse {
  meta: QuorumApiResponseMeta
  objects: QuorumBillSummaryApiObject[]
}

export interface CreateBillEntryPayload {
  name: string
  data: SWCBillFromBuilderIO
}

export interface UpdateBillEntryPayload {
  data: Pick<SWCBillFromBuilderIO, 'keyDates' | 'summary' | 'timelineDescription'>
}

type SWCBillKeys = keyof Required<SWCBillFromBuilderIO>

type QuorumBillWithSummaries = QuorumBillApiObject & { summaries: QuorumBillSummaryApiObject[] }

export type ResolveFieldsMap = {
  [K in SWCBillKeys]: (bill: QuorumBillWithSummaries) => SWCBillFromBuilderIO[K]
}

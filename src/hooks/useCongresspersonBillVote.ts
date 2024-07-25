import useSWR, { SWRConfiguration } from 'swr'

import { BillVoteResult } from '@/app/api/public/dtsi/bill-vote/[billId]/[slug]/route'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

interface UseCongresspersonBillVoteProps {
  slug: string | undefined
  billId: string
  config?: SWRConfiguration<BillVoteResult>
}
export function useCongresspersonBillVote(props: UseCongresspersonBillVoteProps) {
  const { slug, billId, config } = props

  return useSWR(
    slug ? apiUrls.billVote({ slug, billId }) : null,
    (url: string) => {
      return fetchReq(url).then(req => req.json()) as Promise<BillVoteResult>
    },
    config,
  )
}

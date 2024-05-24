'use client'
import useSWR from 'swr'
import { FullConfiguration } from 'swr/_internal'

import { GetUserClaimedOptInNft } from '@/app/api/identified-user/claimed-opt-in-nft/route'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function useApiResponseForUserClaimedOptInNft(
  config?: Pick<FullConfiguration, 'revalidateOnMount' | 'suspense'>,
) {
  return useSWR(
    apiUrls.userClaimedOptInNFT(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as GetUserClaimedOptInNft),
    config,
  )
}

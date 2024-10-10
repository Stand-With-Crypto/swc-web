'use client'

import { useCookie } from 'react-use'
import useSWR, { SWRResponse } from 'swr'

import { INTERNAL_API_TAMPERING_KEY_RACES_ESTIMATED_VOTES_MID } from '@/app/[locale]/internal/api-tampering/key-races/page'
import { GetAllCongressDataResponse } from '@/data/aggregations/decisionDesk/types'
import { SWC_ALL_CONGRESS_DATA } from '@/mocks/decisionDesk'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'

export function useApiDecisionDeskCongressData(fallbackData: GetAllCongressDataResponse | null) {
  const [apiTamperedValue] = useCookie(INTERNAL_API_TAMPERING_KEY_RACES_ESTIMATED_VOTES_MID)

  const swrData = useSWR(
    apiTamperedValue ? null : apiUrls.decisionDeskCongressData(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as GetAllCongressDataResponse),
    {
      fallbackData: fallbackData ?? undefined,
      refreshInterval: 60 * 1000,
      errorRetryInterval: 30 * 1000,
    },
  )

  if (apiTamperedValue) {
    const mockedData = {
      houseDataWithDtsi: {
        ...SWC_ALL_CONGRESS_DATA.houseDataWithDtsi,
        candidatesWithVotes: SWC_ALL_CONGRESS_DATA.houseDataWithDtsi.candidatesWithVotes.map(
          currentHouseCandidate => {
            return {
              ...currentHouseCandidate,
              votes: Math.round((currentHouseCandidate.votes || 1000) * (+apiTamperedValue / 100)),
            }
          },
        ),
      },
      senateDataWithDtsi: {
        ...(SWC_ALL_CONGRESS_DATA as Pick<GetAllCongressDataResponse, 'senateDataWithDtsi'>)
          .senateDataWithDtsi,
        candidatesWithVotes: SWC_ALL_CONGRESS_DATA.senateDataWithDtsi.candidatesWithVotes.map(
          currentSenateCandidate => {
            return {
              ...currentSenateCandidate,
              votes: Math.round((currentSenateCandidate.votes || 1000) * (+apiTamperedValue / 100)),
            }
          },
        ),
      },
    }

    return {
      data: mockedData,
      error: undefined,
      isLoading: false,
      isValidating: false,
    } as SWRResponse<GetAllCongressDataResponse>
  }

  return swrData
}

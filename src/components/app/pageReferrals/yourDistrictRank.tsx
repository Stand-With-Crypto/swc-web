'use client'

import { useMemo } from 'react'

import { ReferralLeaderboardRow } from '@/components/app/pageReferrals/referralLeaderboardRow'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useGetDistrictFromAddress } from '@/hooks/useGetDistrictFromAddress'
import { useGetDistrictRank } from '@/hooks/useGetDistrictRank'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { USStateCode } from '@/utils/shared/usStateUtils'

export function YourDistrictRank() {
  const hasHydrated = useHasHydrated()

  const { data } = useApiResponseForUserFullProfileInfo()
  const user = data?.user

  const address = useMemo(() => user?.address, [user])
  const districtResponse = useGetDistrictFromAddress(address?.formattedDescription)

  const district = useMemo(() => {
    if (!districtResponse.data) {
      return null
    }
    if ('districtNumber' in districtResponse.data) {
      return districtResponse.data.districtNumber.toString()
    }
    return null
  }, [districtResponse.data])

  const districtRankingResponse = useGetDistrictRank({
    stateCode: address?.administrativeAreaLevel1 as USStateCode,
    districtNumber: district,
  })

  if (districtRankingResponse.isLoading || !hasHydrated) {
    return null
  }

  const count = districtRankingResponse.data?.score
  const rank = districtRankingResponse.data?.rank

  if (!rank) {
    return null
  }

  return (
    <div className="space-y-3">
      <p className="pl-4 text-lg font-bold">Your district</p>

      <ReferralLeaderboardRow
        count={count ?? 0}
        district={district ?? ''}
        rank={rank ?? 0}
        state={address?.administrativeAreaLevel1 as USStateCode}
        variant="highlight"
      />
    </div>
  )
}

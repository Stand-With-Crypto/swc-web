'use client'

import { useMemo } from 'react'

import { UserLocationRank } from '@/components/app/pageReferrals/common/userLocationRank'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import { useGetDistrictFromAddress } from '@/hooks/useGetDistrictFromAddress'
import { useGetDistrictRank } from '@/hooks/useGetDistrictRank'
import { CAProvinceCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const COUNTRY_CODE = SupportedCountryCodes.CA

export function CaUserConstituencyRank({ className }: { className?: string }) {
  const { address } = useMutableCurrentUserAddress()
  const districtResponse = useGetDistrictFromAddress({
    address: address === 'loading' ? null : address?.description,
    placeId: address === 'loading' ? null : address?.place_id,
  })

  const district = useMemo(() => {
    if (!districtResponse.data) return null
    if ('notFoundReason' in districtResponse.data) return null
    if (!districtResponse.data.zoneName) return null

    return districtResponse.data
  }, [districtResponse.data])

  const districtRankingResponse = useGetDistrictRank({
    countryCode: COUNTRY_CODE,
    stateCode: district?.stateCode as CAProvinceCode,
    districtNumber: district?.zoneName?.toString() ?? null,
  })

  const rank = districtRankingResponse.data?.rank

  const districtRanking = useMemo(() => {
    if (districtRankingResponse.isLoading || districtResponse.isLoading || address === 'loading') {
      return <UserLocationRank.Skeleton />
    }

    if (!address) {
      return <p>Finish your profile to see your constituency ranking</p>
    }

    if (!rank || !districtRankingResponse.data) {
      return <p>N/A</p>
    }

    return <UserLocationRank.RankOdometer rank={rank} />
  }, [
    districtRankingResponse.data,
    districtRankingResponse.isLoading,
    districtResponse.isLoading,
    address,
    rank,
  ])

  return (
    <UserLocationRank.Wrapper className={className}>
      <UserLocationRank.Label>Constituency ranking</UserLocationRank.Label>
      {districtRanking}
    </UserLocationRank.Wrapper>
  )
}

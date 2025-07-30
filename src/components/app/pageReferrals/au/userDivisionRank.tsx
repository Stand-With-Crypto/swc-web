'use client'

import { useMemo } from 'react'

import { UserLocationRank } from '@/components/app/pageReferrals/userLocationRank'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import { useGetElectoralZoneFromAddress } from '@/hooks/useGetElectoralZoneFromAddress'
import { useGetElectoralZoneRank } from '@/hooks/useGetElectoralZoneRank'
import { AUStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const COUNTRY_CODE = SupportedCountryCodes.AU

export function AuUserDivisionRank({ className }: { className?: string }) {
  const { address } = useMutableCurrentUserAddress()
  const districtResponse = useGetElectoralZoneFromAddress({
    address: address === 'loading' ? null : address?.description,
    placeId: address === 'loading' ? null : address?.place_id,
  })

  const district = useMemo(() => {
    if (!districtResponse.data) return null
    if ('notFoundReason' in districtResponse.data) return null
    if (!districtResponse.data.zoneName) return null

    return districtResponse.data
  }, [districtResponse.data])

  const districtRankingResponse = useGetElectoralZoneRank({
    countryCode: COUNTRY_CODE,
    stateCode: district?.administrativeArea as AUStateCode,
    electoralZone: district?.zoneName?.toString() ?? null,
  })

  const rank = districtRankingResponse.data?.rank

  const districtRanking = useMemo(() => {
    if (districtRankingResponse.isLoading || districtResponse.isLoading || address === 'loading') {
      return <UserLocationRank.Skeleton />
    }

    if (!address) {
      return <p>Finish your profile to see your division ranking</p>
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
      <UserLocationRank.Label>Division ranking</UserLocationRank.Label>
      {districtRanking}
    </UserLocationRank.Wrapper>
  )
}

'use client'

import { useMemo } from 'react'

import { useUserAddress } from '@/components/app/pageReferrals/common/userAddress.context'
import { UserLocationRank } from '@/components/app/pageReferrals/common/userLocationRank'

export function AuUserDivisionRank({ className }: { className?: string }) {
  const { address, isLoading, electoralZone, electoralZoneRanking } = useUserAddress()

  const districtRanking = useMemo(() => {
    if (isLoading) {
      return <UserLocationRank.Skeleton />
    }

    if (!address?.description) {
      return <p>Finish your profile to see your division ranking</p>
    }

    if (!electoralZoneRanking?.rank || !electoralZone) {
      return <p>N/A</p>
    }

    return <UserLocationRank.RankOdometer rank={electoralZoneRanking.rank ?? 0} />
  }, [electoralZoneRanking?.rank, electoralZone, isLoading, address?.description])

  return (
    <UserLocationRank.Wrapper className={className}>
      <UserLocationRank.Label>Division ranking</UserLocationRank.Label>
      {districtRanking}
    </UserLocationRank.Wrapper>
  )
}

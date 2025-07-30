'use client'

import { useMemo } from 'react'

import { useUserAddress } from '@/components/app/pageReferrals/userAddress.context'
import { UserLocationRank } from '@/components/app/pageReferrals/userLocationRank'

export function CaUserConstituencyRank({ className }: { className?: string }) {
  const { address, isLoading, electoralZone, electoralZoneRanking } = useUserAddress()

  const districtRanking = useMemo(() => {
    if (isLoading) {
      return <UserLocationRank.Skeleton />
    }

    if (!address?.description) {
      return <p>Finish your profile to see your constituency ranking</p>
    }

    if (!electoralZoneRanking?.rank || !electoralZone) {
      return <p>N/A</p>
    }

    return <UserLocationRank.RankOdometer rank={electoralZoneRanking.rank ?? 0} />
  }, [address?.description, electoralZoneRanking, electoralZone, isLoading])

  return (
    <UserLocationRank.Wrapper className={className}>
      <UserLocationRank.Label>Constituency ranking</UserLocationRank.Label>
      {districtRanking}
    </UserLocationRank.Wrapper>
  )
}

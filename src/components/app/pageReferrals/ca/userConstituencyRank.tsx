'use client'

import { UserLocationRanking } from '@/components/app/pageReferrals/common/userLocationRank'

export function CaUserConstituencyRank({ className }: { className?: string }) {
  return (
    <UserLocationRanking
      className={className}
      finishProfileText="Finish your profile to see your constituency ranking"
      label="Constituency ranking"
      notFoundText="N/A"
    />
  )
}

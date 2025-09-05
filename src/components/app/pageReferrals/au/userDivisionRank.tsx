'use client'

import { UserLocationRanking } from '@/components/app/pageReferrals/common/userLocationRank'

export function AuUserDivisionRank({ className }: { className?: string }) {
  return (
    <UserLocationRanking
      className={className}
      finishProfileText="Finish your profile to see your division ranking"
      label="Division ranking"
      notFoundText="N/A"
    />
  )
}

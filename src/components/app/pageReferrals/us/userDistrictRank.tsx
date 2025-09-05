'use client'

import { UserLocationRanking } from '@/components/app/pageReferrals/common/userLocationRank'

export function UsUserDistrictRank({ className }: { className?: string }) {
  return (
    <UserLocationRanking
      className={className}
      finishProfileText="Finish your profile to see your district ranking"
      label="District ranking"
      notFoundText="N/A"
    />
  )
}

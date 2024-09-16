'use client'

import { UserActionType } from '@prisma/client'

import { USER_ACTION_CTAS_FOR_GRID_DISPLAY } from '@/components/app/userActionGridCTAs/constants'
import { UserActionCard } from '@/components/app/userActionGridCTAs/userActionCard'

interface UserActionGridCTAsSkeletonProps {
  excludeUserActionTypes?: UserActionType[]
}

export function UserActionGridCTAsSkeleton({
  excludeUserActionTypes,
}: UserActionGridCTAsSkeletonProps) {
  const ctas = excludeUserActionTypes
    ? Object.entries(USER_ACTION_CTAS_FOR_GRID_DISPLAY)
        .filter(([key, _]) => !excludeUserActionTypes?.includes(key))
        .map(([_, value]) => value)
    : Object.values(USER_ACTION_CTAS_FOR_GRID_DISPLAY)

  return (
    <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-3">
      {ctas.map(cta => {
        const filteredCampaigns = cta.campaigns.filter(campaign => campaign.isCampaignActive)

        return (
          <UserActionCard
            campaigns={filteredCampaigns}
            campaignsLength={filteredCampaigns.length}
            campaignsModalDescription={cta.campaignsModalDescription}
            completedCampaigns={0}
            description={cta.description}
            image={cta.image}
            key={cta.title + cta.description}
            link={cta.link}
            mobileCTADescription={cta.mobileCTADescription}
            performedUserActions={{}}
            title={cta.title}
          />
        )
      })}
    </div>
  )
}

'use client'

import { UserActionType } from '@prisma/client'

import { UserActionCard } from '@/components/app/userActionGridCTAs/components/userActionCard'
import { useGridCTAs } from '@/components/app/userActionGridCTAs/hooks/useGridCTAs'
import { cn } from '@/utils/web/cn'

interface UserActionGridCTAsSkeletonProps {
  excludeUserActionTypes?: UserActionType[]
}

export function UserActionGridCTAsSkeleton({
  excludeUserActionTypes,
}: UserActionGridCTAsSkeletonProps) {
  const { ctas } = useGridCTAs({ excludeUserActionTypes, performedUserActionTypes: [] })

  return (
    <div
      className={cn(
        ctas.length < 3
          ? 'flex flex-col lg:flex-row lg:flex-wrap lg:justify-center'
          : 'grid grid-cols-1 lg:grid-cols-3 lg:justify-items-center',
        'gap-6',
      )}
    >
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

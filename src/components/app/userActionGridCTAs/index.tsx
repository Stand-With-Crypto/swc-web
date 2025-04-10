'use client'

import { UserActionType } from '@prisma/client'

import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/components/userActionGridCTA'
import { useGridCTAs } from '@/components/app/userActionGridCTAs/hooks/useGridCTAs'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { cn } from '@/utils/web/cn'

interface UserActionGridCTAProps {
  excludeUserActionTypes?: UserActionType[]
}

export function UserActionGridCTAs({ excludeUserActionTypes }: UserActionGridCTAProps) {
  const { data } = useApiResponseForUserPerformedUserActionTypes()
  const performedUserActionTypes = data?.performedUserActionTypes ?? []

  const { ctas, performedUserActionObj } = useGridCTAs({
    excludeUserActionTypes,
    performedUserActionTypes,
  })

  return (
    <div
      className={cn(
        ctas.length < 3
          ? 'flex flex-col lg:flex-row lg:flex-wrap lg:justify-center'
          : 'grid grid-cols-1 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] lg:justify-items-center',
        'gap-[18px]',
      )}
    >
      {ctas.map(cta => {
        const completedCampaigns = cta.campaigns.reduce((acc, campaign) => {
          const key = `${campaign.actionType}-${campaign.campaignName}`
          return performedUserActionObj[key] ? acc + 1 : acc
        }, 0)
        const filteredCampaigns = cta.campaigns.filter(campaign => {
          const key = `${campaign.actionType}-${campaign.campaignName}`
          return campaign.isCampaignActive || !!performedUserActionObj[key]
        })

        return (
          <UserActionGridCTA
            campaigns={filteredCampaigns}
            campaignsLength={
              completedCampaigns > filteredCampaigns.length
                ? completedCampaigns
                : filteredCampaigns.length
            }
            campaignsModalDescription={cta.campaignsModalDescription}
            completedCampaigns={completedCampaigns}
            description={cta.description}
            image={cta.image}
            key={cta.title + cta.description}
            link={cta.link}
            mobileCTADescription={cta.mobileCTADescription}
            performedUserActions={performedUserActionObj}
            title={cta.title}
          />
        )
      })}
    </div>
  )
}

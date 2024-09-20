'use client'

import { UserActionType } from '@prisma/client'

import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/components/userActionGridCTA'
import { useGridCTAs } from '@/components/app/userActionGridCTAs/hooks/useGridCTAs'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'

interface UserActionGridCTAProps {
  excludeUserActionTypes?: UserActionType[]
}

export function UserActionGridCTAs({ excludeUserActionTypes }: UserActionGridCTAProps) {
  const { data } = useApiResponseForUserPerformedUserActionTypes()
  const performedUserActionTypes = data?.performedUserActionTypes ?? []

  const { ctas, performeduserActionObj } = useGridCTAs({
    excludeUserActionTypes,
    performedUserActionTypes,
  })

  return (
    <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-3">
      {ctas.map(cta => {
        const completedCampaigns = cta.campaigns.reduce((acc, campaign) => {
          const key = `${campaign.actionType}-${campaign.campaignName}`
          return performeduserActionObj[key] ? acc + 1 : acc
        }, 0)
        const filteredCampaigns = cta.campaigns.filter(campaign => {
          const key = `${campaign.actionType}-${campaign.campaignName}`
          return campaign.isCampaignActive || !!performeduserActionObj[key]
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
            performedUserActions={performeduserActionObj}
            title={cta.title}
          />
        )
      })}
    </div>
  )
}

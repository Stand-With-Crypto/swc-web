'use client'

import { UserActionType } from '@prisma/client'

import { SuccessScreenActionGridCTA } from '@/components/app/userActionGridCTAs/components/successScreenActionGridCTA'
import { useOrderedCTAs } from '@/components/app/userActionGridCTAs/hooks/useOrderedCTAs'

interface SuccessScreenCTASProps {
  excludeUserActionTypes?: UserActionType[]
  performedUserActionTypes: {
    actionType: UserActionType
    campaignName: string
  }[]
}

export function SuccessScreenCTAS({
  excludeUserActionTypes,
  performedUserActionTypes,
}: SuccessScreenCTASProps) {
  const { orderedCTAs, performedUserActionObj } = useOrderedCTAs({
    performedUserActionTypes,
    excludeUserActionTypes,
  })

  return (
    <div className="flex flex-col gap-[18px]">
      {orderedCTAs.map(cta => {
        const completedCampaigns = cta.campaigns.reduce((acc, campaign) => {
          const key = `${campaign.actionType}-${campaign.campaignName}`
          return performedUserActionObj[key] ? acc + 1 : acc
        }, 0)
        const filteredCampaigns = cta.campaigns.filter(campaign => {
          const key = `${campaign.actionType}-${campaign.campaignName}`
          return campaign.isCampaignActive || !!performedUserActionObj[key]
        })

        return (
          <SuccessScreenActionGridCTA
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

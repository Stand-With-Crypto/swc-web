import { Fragment } from 'react'

import { UserActionCard } from '@/components/app/userActionGridCTAs/components/userActionCard'
import { UserActionGridCampaignsDialog } from '@/components/app/userActionGridCTAs/components/userActionGridCampaignsDialog'
import type { UserActionCardProps as UserActionGridCTAProps } from '@/components/app/userActionGridCTAs/types'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export function UserActionGridCTA(props: UserActionGridCTAProps) {
  const firstCampaign = props.campaigns[0]

  // If there is only one campaign, clicking the CTA will trigger the WrapperComponent for that campaign.
  const shouldUseFirstCampaignWrapperComponent = props.campaignsLength === 1

  if (props.link) {
    // If the link property is present, the CTA will function as a link, even if there are multiple campaigns.
    const LinkComponent = props.link

    return (
      <ErrorBoundary
        extras={{
          action: {
            campaignName: firstCampaign.campaignName,
            actionType: firstCampaign.actionType,
            isActive: firstCampaign.isCampaignActive,
            title: firstCampaign.title,
            description: firstCampaign.description,
            singleCampaign: shouldUseFirstCampaignWrapperComponent,
            isLink: true,
          },
        }}
        severityLevel="error"
        tags={{
          domain: 'UserActionGridCTA',
        }}
      >
        <LinkComponent>
          <UserActionCard {...props} />
        </LinkComponent>
      </ErrorBoundary>
    )
  }

  if (shouldUseFirstCampaignWrapperComponent) {
    const WrapperComponent = firstCampaign.WrapperComponent ?? Fragment

    return (
      <ErrorBoundary
        extras={{
          action: {
            campaignName: firstCampaign.campaignName,
            actionType: firstCampaign.actionType,
            isActive: firstCampaign.isCampaignActive,
            title: firstCampaign.title,
            description: firstCampaign.description,
            singleCampaign: shouldUseFirstCampaignWrapperComponent,
            isLink: false,
          },
        }}
        severityLevel="error"
        tags={{
          domain: 'UserActionGridCTA',
        }}
      >
        <WrapperComponent>
          <UserActionCard {...props} />
        </WrapperComponent>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary
      extras={{
        action: {
          campaignName: firstCampaign.campaignName,
          actionType: firstCampaign.actionType,
          isActive: firstCampaign.isCampaignActive,
          title: firstCampaign.title,
          description: firstCampaign.description,
          singleCampaign: shouldUseFirstCampaignWrapperComponent,
          isLink: false,
        },
      }}
      severityLevel="error"
      tags={{
        domain: 'UserActionGridCTA',
      }}
    >
      <UserActionGridCampaignsDialog
        {...props}
        description={props.campaignsModalDescription}
        performedUserActions={props.performedUserActions}
      >
        <UserActionCard {...props} />
      </UserActionGridCampaignsDialog>
    </ErrorBoundary>
  )
}

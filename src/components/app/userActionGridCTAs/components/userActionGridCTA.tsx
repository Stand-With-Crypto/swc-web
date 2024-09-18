import { UserActionCard } from '@/components/app/userActionGridCTAs/components/userActionCard'
import { UserActionGridCampaignsDialog } from '@/components/app/userActionGridCTAs/components/userActionGridCampaignsDialog'
import type { UserActionCardProps as UserActionGridCTAProps } from '@/components/app/userActionGridCTAs/types'

export function UserActionGridCTA(props: UserActionGridCTAProps) {
  if (props.link) {
    // If the link property is present, the CTA will function as a link, even if there are multiple campaigns.
    const LinkComponent = props.link
    return (
      <LinkComponent>
        <UserActionCard {...props} />
      </LinkComponent>
    )
  }

  // If there is only one campaign, clicking the CTA will trigger the WrapperComponent for that campaign.
  const shouldUseFirstCampaignWrapperComponent = props.campaignsLength === 1

  if (shouldUseFirstCampaignWrapperComponent) {
    const WrapperComponent = props.campaigns[0].WrapperComponent

    return (
      <WrapperComponent>
        <UserActionCard {...props} />
      </WrapperComponent>
    )
  }

  return (
    <UserActionGridCampaignsDialog
      {...props}
      description={props.campaignsModalDescription}
      performedUserActions={props.performedUserActions}
    >
      <UserActionCard {...props} />
    </UserActionGridCampaignsDialog>
  )
}

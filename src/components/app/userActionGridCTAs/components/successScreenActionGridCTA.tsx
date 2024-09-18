import Link from 'next/link'

import { SuccessScreenActionCard } from '@/components/app/userActionGridCTAs/components/successScreenActionCard'
import { UserActionGridCampaignsDialog } from '@/components/app/userActionGridCTAs/components/userActionGridCampaignsDialog'
import { UserActionCardProps } from '@/components/app/userActionGridCTAs/types'
import { useLocale } from '@/hooks/useLocale'
import {
  getUserActionDeeplink,
  UserActionTypesWithDeeplink,
} from '@/utils/shared/urlsDeeplinkUserActions'

export function SuccessScreenActionGridCTA(props: UserActionCardProps) {
  const locale = useLocale()

  if (props.link) {
    const LinkComponent = props.link
    return (
      <LinkComponent>
        <SuccessScreenActionCard {...props} />
      </LinkComponent>
    )
  }

  if (props.campaignsLength === 1) {
    const campaign = props.campaigns[0]

    const url = getUserActionDeeplink({
      actionType: campaign.actionType as UserActionTypesWithDeeplink,
      config: {
        locale,
      },
      campaign: campaign.campaignName as any,
    })

    return (
      <Link href={url}>
        <SuccessScreenActionCard {...props} />
      </Link>
    )
  }

  return (
    <UserActionGridCampaignsDialog
      {...props}
      description={props.campaignsModalDescription}
      performedUserActions={props.performedUserActions}
      shouldOpenDeeplink={true}
    >
      <SuccessScreenActionCard {...props} />
    </UserActionGridCampaignsDialog>
  )
}

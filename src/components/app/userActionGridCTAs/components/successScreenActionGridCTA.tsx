import Link from 'next/link'

import { SuccessScreenActionCard } from '@/components/app/userActionGridCTAs/components/successScreenActionCard'
import { UserActionGridCampaignsDialog } from '@/components/app/userActionGridCTAs/components/userActionGridCampaignsDialog'
import { UserActionCardProps } from '@/components/app/userActionGridCTAs/types'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useSuccessScreenDialogContext } from '@/hooks/useSuccessScreenDialogContext'
import {
  getUserActionDeeplink,
  UserActionTypesWithDeeplink,
} from '@/utils/shared/urlsDeeplinkUserActions'

export function SuccessScreenActionGridCTA(props: UserActionCardProps) {
  const { shouldCloseSuccessScreenDialog } = useSuccessScreenDialogContext()

  const countryCode = useCountryCode()

  if (props.link) {
    const LinkComponent = props.link
    return (
      <LinkComponent>
        <SuccessScreenActionCard {...props} onClick={shouldCloseSuccessScreenDialog} />
      </LinkComponent>
    )
  }

  if (props.campaignsLength === 1) {
    const campaign = props.campaigns[0]

    const url = getUserActionDeeplink({
      actionType: campaign.actionType as UserActionTypesWithDeeplink,
      config: {
        countryCode,
      },
      campaign: campaign.campaignName as any,
    })

    return (
      <Link href={url}>
        <SuccessScreenActionCard {...props} onClick={shouldCloseSuccessScreenDialog} />
      </Link>
    )
  }

  return (
    <UserActionGridCampaignsDialog
      {...props}
      description={props.campaignsModalDescription}
      onClickAction={shouldCloseSuccessScreenDialog}
      performedUserActions={props.performedUserActions}
      shouldOpenDeeplink={true}
    >
      <SuccessScreenActionCard {...props} />
    </UserActionGridCampaignsDialog>
  )
}

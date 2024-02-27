'use client'

import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { MESSAGES } from '@/components/app/userActionLiveEvent/constants'
import { UserActionLiveEventSkeleton } from '@/components/app/userActionLiveEvent/skeleton'
import { Button } from '@/components/ui/button'
import { useThirdwebData } from '@/hooks/useThirdwebData'
import { UserActionLiveEventCampaignName } from '@/utils/shared/userActionCampaigns'

export type UserActionLiveEventProps = {
  slug: UserActionLiveEventCampaignName
}

export function UserActionLiveEvent({ slug }: UserActionLiveEventProps) {
  const { session } = useThirdwebData()
  const { isLoggedIn, isLoading } = session

  if (isLoading) {
    return <UserActionLiveEventSkeleton slug={slug} />
  }

  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container>
        <div className="flex h-full  flex-col items-center justify-center gap-4">
          <UserActionFormLayout.Heading
            subtitle={MESSAGES[slug][isLoggedIn ? 'signedInSubtitle' : 'signedOutSubtitle']}
            title={MESSAGES[slug].title}
          />
          <Button>{isLoggedIn ? 'Claim NFT' : 'Sign in to claim'}</Button>
        </div>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}

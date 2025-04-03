'use client'

import { useEffect } from 'react'

import { UserActionFormTweetAtPerson } from '@/components/app/userActionFormTweetAtPerson'
import { CAMPAIGN_METADATA } from '@/components/app/userActionFormTweetAtPerson/constants'
import { UserActionFormTweetAtPersonSkeleton } from '@/components/app/userActionFormTweetAtPerson/skeletons/dialogSkeleton'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { useSession } from '@/hooks/useSession'
import { USUserActionTweetAtPersonCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

interface UserActionFormTweetToPersonDeeplinkWrapperProps {
  slug: USUserActionTweetAtPersonCampaignName
}

export function UserActionFormTweetToPersonDeeplinkWrapper({
  slug,
}: UserActionFormTweetToPersonDeeplinkWrapperProps) {
  usePreventOverscroll()

  const session = useSession()
  const { isLoading } = session

  useEffect(() => {
    trackDialogOpen({ open: true, analytics: CAMPAIGN_METADATA[slug].analyticsName })
  }, [slug])

  if (isLoading) {
    return <UserActionFormTweetAtPersonSkeleton />
  }

  return <UserActionFormTweetAtPerson slug={slug} />
}

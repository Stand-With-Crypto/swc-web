import { useCallback, useState } from 'react'
import { UserActionType } from '@prisma/client'
import { useRouter } from 'next/navigation'

import {
  actionCreateUserActionLiveEvent,
  CreateActionLiveEventInput,
} from '@/actions/actionCreateUserActionLiveEvent'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { MESSAGES, SectionNames } from '@/components/app/userActionFormLiveEvent/constants'
import { Button } from '@/components/ui/button'
import { UseSectionsReturn } from '@/hooks/useSections'
import { UserActionLiveEventCampaignName } from '@/utils/shared/userActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { toastGenericError } from '@/utils/web/toastUtils'

interface Props extends UseSectionsReturn<SectionNames> {
  isLoggedIn: boolean
  slug: UserActionLiveEventCampaignName
}

export function ClaimNft({ isLoggedIn, slug, goToSection }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleClaimNft = useCallback(async () => {
    setLoading(true)
    const data: CreateActionLiveEventInput = {
      campaignName: slug,
    }

    const result = await triggerServerActionForForm(
      {
        formName: 'User Action Form Live Event',
        onError: toastGenericError,
        analyticsProps: {
          'Campaign Name': data.campaignName,
          'User Action Type': UserActionType.LIVE_EVENT,
        },
        payload: data,
      },
      payload =>
        actionCreateUserActionLiveEvent(payload).then(actionResult => {
          if (actionResult.user) {
            identifyUserOnClient(actionResult.user)
          }
          return actionResult
        }),
    )

    if (result.status === 'success') {
      router.refresh()
      goToSection(SectionNames.SUCCESS)
    }
    setLoading(false)
  }, [goToSection, router, slug])

  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container>
        <div className="flex h-full  flex-col items-center justify-center gap-4">
          <UserActionFormLayout.Heading
            subtitle={MESSAGES[slug][isLoggedIn ? 'signedInSubtitle' : 'signedOutSubtitle']}
            title={MESSAGES[slug].title}
          />
          <Button disabled={loading} onClick={handleClaimNft}>
            {isLoggedIn ? 'Claim NFT' : 'Sign in to claim'}
          </Button>
        </div>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}

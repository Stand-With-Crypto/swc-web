import { useCallback, useState } from 'react'
import { UserActionType } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  actionCreateUserActionLiveEvent,
  CreateActionLiveEventInput,
} from '@/actions/actionCreateUserActionLiveEvent'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import {
  LIVE_EVENT_SLUG_NFT_METADATA,
  MESSAGES,
  SectionNames,
} from '@/components/app/userActionFormLiveEvent/constants'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { UseSectionsReturn } from '@/hooks/useSections'
import { UserActionLiveEventCampaignName } from '@/utils/shared/userActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'
import { toastGenericError } from '@/utils/web/toastUtils'

interface Props extends UseSectionsReturn<SectionNames> {
  isLoggedIn: boolean
  slug: UserActionLiveEventCampaignName
}

export function ClaimNft({ isLoggedIn, slug, goToSection }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const nftImageMetadata = NFT_CLIENT_METADATA[LIVE_EVENT_SLUG_NFT_METADATA[slug]].image

  const handleClaimNft = useCallback(async () => {
    setLoading(true)
    const data: CreateActionLiveEventInput = {
      campaignName: slug,
    }

    const result = await triggerServerActionForForm(
      {
        formName: 'User Action Form Live Event',
        onError: (_, error) => {
          toast.error(error.message, {
            duration: 5000,
          })
        },
        analyticsProps: {
          'Campaign Name': data.campaignName,
          'User Action Type': UserActionType.LIVE_EVENT,
        },
        payload: data,
      },
      payload =>
        actionCreateUserActionLiveEvent(payload).then(async actionResultPromise => {
          const actionResult = await actionResultPromise
          if (actionResult?.user) {
            identifyUserOnClient(actionResult.user)
          }
          return actionResult
        }),
    )

    if (result.status === 'success') {
      router.refresh()
      goToSection(SectionNames.SUCCESS)
    } else {
      toastGenericError()
    }
    setLoading(false)
  }, [goToSection, router, slug])

  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container>
        <div className="flex h-full  flex-col items-center justify-center gap-4">
          <NextImage
            alt={nftImageMetadata.alt}
            className="rounded-lg"
            height={nftImageMetadata.height}
            src={nftImageMetadata.url}
            width={nftImageMetadata.width}
          />
          <UserActionFormLayout.Heading
            subtitle={MESSAGES[slug][isLoggedIn ? 'signedInSubtitle' : 'signedOutSubtitle']}
            title={MESSAGES[slug].title}
          />
          <Button disabled={loading} onClick={handleClaimNft}>
            Continue
          </Button>
        </div>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}

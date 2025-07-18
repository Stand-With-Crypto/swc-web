'use client'

import { useEffect, useState } from 'react'
import { UserActionType } from '@prisma/client'
import { ClaimNFTIntro } from 'src/components/app/userActionFormClaimNFT/common/sections/intro'
import { UserActionFormClaimNFTProps } from 'src/components/app/userActionFormClaimNFT/common/types'

import { actionCreateUserActionClaimNFT } from '@/actions/actionCreateUserActionClaimNFT'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_CLAIM_NFT,
  UserActionFormClaimNFTSectionNames,
} from '@/components/app/userActionFormClaimNFT/common/constants'
import { UserActionFormClaimNFTSuccess } from '@/components/app/userActionFormClaimNFT/common/sections/success'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useSections } from '@/hooks/useSections'
import { USUserActionClaimNftCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'
import { toastGenericError } from '@/utils/web/toastUtils'

export function USUserActionFormClaimNFT({
  nftSlug,
  onFinished,
  trackMount,
}: Omit<UserActionFormClaimNFTProps, 'countryCode'>) {
  const sectionProps = useSections({
    sections: Object.values(UserActionFormClaimNFTSectionNames),
    initialSectionId: UserActionFormClaimNFTSectionNames.INTRO,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_CLAIM_NFT,
  })
  const [isClaiming, setIsClaiming] = useState(false)

  useEffect(() => {
    if (trackMount) {
      trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_CLAIM_NFT })
    }
  }, [trackMount])

  const handleSubmit = async () => {
    setIsClaiming(true)
    const result = await triggerServerActionForForm(
      {
        formName: 'User Action Form Claim NFT',
        payload: { campaignName: USUserActionClaimNftCampaignName.GENIUS_ACT_2025 },
        onError: toastGenericError,
        analyticsProps: {
          'Campaign Name': USUserActionClaimNftCampaignName.GENIUS_ACT_2025,
          'User Action Type': UserActionType.CLAIM_NFT,
        },
      },
      actionCreateUserActionClaimNFT,
    ).finally(() => setIsClaiming(false))

    if (result.status === 'success') {
      sectionProps.goToSection(UserActionFormClaimNFTSectionNames.SUCCESS)
    }
  }

  switch (sectionProps.currentSection) {
    case UserActionFormClaimNFTSectionNames.INTRO:
      return (
        <ClaimNFTIntro>
          <ClaimNFTIntro.ContractMetadataDisplay contractMetadata={NFT_CLIENT_METADATA[nftSlug]} />
          <ClaimNFTIntro.Footer disclaimer="This NFT is purely commemorative in nature and has no value or utility. It is not intended for trading.">
            <ClaimNFTIntro.ClaimButton disabled={isClaiming} onClick={handleSubmit} />
          </ClaimNFTIntro.Footer>
        </ClaimNFTIntro>
      )

    case UserActionFormClaimNFTSectionNames.SUCCESS:
      return <UserActionFormClaimNFTSuccess nftSlug={nftSlug} onClose={onFinished} />

    default:
      sectionProps.onSectionNotFound()
      return null
  }
}

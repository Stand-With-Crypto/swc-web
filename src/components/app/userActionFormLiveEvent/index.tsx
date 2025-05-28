'use client'

import { ClaimNft } from '@/components/app/userActionFormLiveEvent/claimNft'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_LIVE_EVENT,
  SectionNames,
} from '@/components/app/userActionFormLiveEvent/constants'
import { UserActionFormLiveEventSuccess } from '@/components/app/userActionFormLiveEvent/success'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { useSections } from '@/hooks/useSections'
import { NFTSlug } from '@/utils/shared/nft'
import { USUserActionLiveEventCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'

export interface UserActionFormLiveEventProps {
  slug: USUserActionLiveEventCampaignName
  onClose: () => void
  isLoggedIn: boolean
}

export function UserActionFormLiveEvent({
  slug,
  isLoggedIn,
  onClose,
}: UserActionFormLiveEventProps) {
  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.LANDING,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_LIVE_EVENT,
  })
  const { currentSection: currentTab, onSectionNotFound: onTabNotFound } = sectionProps

  switch (currentTab) {
    case SectionNames.LANDING:
      return <ClaimNft {...sectionProps} isLoggedIn={isLoggedIn} slug={slug} />
    case SectionNames.SUCCESS:
      return (
        <UserActionFormSuccessScreen onClose={onClose}>
          <UserActionFormLiveEventSuccess
            {...NFT_CLIENT_METADATA[NFTSlug.LA_CRYPTO_EVENT_2024_03_04]}
          />
        </UserActionFormSuccessScreen>
      )
    default:
      onTabNotFound()
      return null
  }
}

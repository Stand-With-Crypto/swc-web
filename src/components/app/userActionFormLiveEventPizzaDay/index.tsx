'use client'

import {
  ANALYTICS_NAME_USER_ACTION_FORM_LIVE_EVENT,
  SectionNames,
} from '@/components/app/userActionFormLiveEventPizzaDay/constants'
import { OnboardingPizzaDayLiveEvent } from '@/components/app/userActionFormLiveEventPizzaDay/onboarding'
import { useSections } from '@/hooks/useSections'
import { UserActionLiveEventCampaignName } from '@/utils/shared/userActionCampaigns'

export type UserActionFormLiveEventProps = {
  slug: UserActionLiveEventCampaignName
  onClose: () => void
  isLoggedIn: boolean
}

export function UserActionFormPizzaDayLiveEvent({
  slug,
  isLoggedIn,
  onClose,
}: UserActionFormLiveEventProps) {
  const sectionProps = useSections<SectionNames>({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.ONBOARDING,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_LIVE_EVENT,
  })
  const { currentSection: currentTab, onSectionNotFound: onTabNotFound } = sectionProps

  switch (currentTab) {
    case SectionNames.ONBOARDING:
      return <OnboardingPizzaDayLiveEvent />
    // case SectionNames.TWEET:
    // return <ClaimNft {...sectionProps} isLoggedIn={isLoggedIn} slug={slug} />
    // case SectionNames.SUCCESS:
    //   return (
    //     <UserActionFormSuccessScreen
    //       nftWhenAuthenticated={NFT_CLIENT_METADATA[NFTSlug.LA_CRYPTO_EVENT_2024_03_04]}
    //       onClose={onClose}
    //     />
    //   )
    default:
      onTabNotFound()
      return null
  }
}

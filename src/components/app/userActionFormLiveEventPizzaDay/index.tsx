'use client'

import {
  ANALYTICS_NAME_USER_ACTION_FORM_LIVE_EVENT,
  SectionNames,
} from '@/components/app/userActionFormLiveEventPizzaDay/constants'
import { OnboardingPizzaDayLiveEvent } from '@/components/app/userActionFormLiveEventPizzaDay/sessions/onboarding'
import { ProfileInfoWrapper } from '@/components/app/userActionFormLiveEventPizzaDay/sessions/profileInfoWrapper'
import { TweetPizzaDayLiveEvent } from '@/components/app/userActionFormLiveEventPizzaDay/sessions/tweet'
import { useSections } from '@/hooks/useSections'

export type UserActionFormLiveEventProps = {
  onClose: () => void
  isLoggedIn: boolean
}

export function UserActionFormPizzaDayLiveEvent({ onClose }: UserActionFormLiveEventProps) {
  const sectionProps = useSections<SectionNames>({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.ONBOARDING,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_LIVE_EVENT,
  })
  const { currentSection: currentTab, onSectionNotFound: onTabNotFound } = sectionProps

  switch (currentTab) {
    case SectionNames.ONBOARDING:
      return <OnboardingPizzaDayLiveEvent {...sectionProps} />
    case SectionNames.PROFILE_INFO:
      return <ProfileInfoWrapper {...sectionProps} />
    case SectionNames.TWEET:
      return <TweetPizzaDayLiveEvent {...sectionProps} />
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

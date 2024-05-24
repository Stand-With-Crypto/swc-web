'use client'

import { ArrowLeft } from 'lucide-react'

import { AuthenticateWithProfileUpdate } from '@/components/app/authentication/authenticateAndUpdateProfile'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import {
  CAMPAIGN_METADATA,
  TweetAtPersonSectionNames,
} from '@/components/app/userActionFormTweetAtPerson/constants'
import { OnboardingTweetAtPersonCampaign } from '@/components/app/userActionFormTweetAtPerson/sessions/onboarding'
import { TweetAtPersonSection } from '@/components/app/userActionFormTweetAtPerson/sessions/tweet'
import { dialogButtonStyles } from '@/components/ui/dialog/styles'
import { useSections } from '@/hooks/useSections'
import { NFTSlug } from '@/utils/shared/nft'
import { UserActionTweetAtPersonCampaignName } from '@/utils/shared/userActionCampaigns'
import { cn } from '@/utils/web/cn'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'

interface UserActionFormTweetAtPersonProps {
  slug: UserActionTweetAtPersonCampaignName
}

export function UserActionFormTweetAtPerson({ slug }: UserActionFormTweetAtPersonProps) {
  const sectionProps = useSections<TweetAtPersonSectionNames>({
    sections: Object.values(TweetAtPersonSectionNames),
    initialSectionId: TweetAtPersonSectionNames.ONBOARDING,
    analyticsName: CAMPAIGN_METADATA[slug].analyticsName,
  })
  const { currentSection: currentTab, onSectionNotFound: onTabNotFound } = sectionProps

  switch (currentTab) {
    case TweetAtPersonSectionNames.ONBOARDING:
      return <OnboardingTweetAtPersonCampaign {...sectionProps} />
    case TweetAtPersonSectionNames.TWEET:
      return (
        <>
          <div
            className={cn('left-2', dialogButtonStyles)}
            onClick={() => sectionProps.goToSection(TweetAtPersonSectionNames.ONBOARDING)}
            role="button"
          >
            <ArrowLeft size={20} />
          </div>

          <AuthenticateWithProfileUpdate>
            <TweetAtPersonSection sectionProps={sectionProps} slug={slug} />
          </AuthenticateWithProfileUpdate>
        </>
      )
    case TweetAtPersonSectionNames.SUCCESS:
      return (
        <UserActionFormSuccessScreen
          nftWhenAuthenticated={NFT_CLIENT_METADATA[NFTSlug.PIZZA_DAY_2024_05_22]}
          onClose={() => {}}
        />
      )
    default:
      onTabNotFound()
      return null
  }
}

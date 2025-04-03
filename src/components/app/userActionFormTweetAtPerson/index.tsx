'use client'

import { ArrowLeft } from 'lucide-react'

import { AuthenticateWithProfileUpdate } from '@/components/app/authentication/authenticateAndUpdateProfile'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import {
  CAMPAIGN_METADATA,
  TweetAtPersonSectionNames,
} from '@/components/app/userActionFormTweetAtPerson/constants'
import { OnboardingTweetAtPersonCampaign } from '@/components/app/userActionFormTweetAtPerson/sessions/onboarding'
import { TweetAtPersonSection } from '@/components/app/userActionFormTweetAtPerson/sessions/tweet'
import { dialogButtonStyles } from '@/components/ui/dialog/styles'
import { NextImage } from '@/components/ui/image'
import { useSections } from '@/hooks/useSections'
import { NFTSlug } from '@/utils/shared/nft'
import { USUserActionTweetAtPersonCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { cn } from '@/utils/web/cn'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'

interface UserActionFormTweetAtPersonProps {
  slug: USUserActionTweetAtPersonCampaignName
}

export function UserActionFormTweetAtPerson({ slug }: UserActionFormTweetAtPersonProps) {
  const sectionProps = useSections({
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
        <UserActionFormSuccessScreen onClose={() => {}}>
          <UserActionFormSuccessScreenFeedback
            description={NFT_CLIENT_METADATA[NFTSlug.PIZZA_DAY_2024_05_22].description}
            image={
              <NextImage
                src={NFT_CLIENT_METADATA[NFTSlug.PIZZA_DAY_2024_05_22].image.url}
                {...NFT_CLIENT_METADATA[NFTSlug.PIZZA_DAY_2024_05_22].image}
              />
            }
            title={NFT_CLIENT_METADATA[NFTSlug.PIZZA_DAY_2024_05_22].name}
          />
        </UserActionFormSuccessScreen>
      )
    default:
      onTabNotFound()
      return null
  }
}

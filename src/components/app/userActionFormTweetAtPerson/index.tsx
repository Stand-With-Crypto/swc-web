'use client'

import { AuthenticateWithProfileUpdate } from '@/components/app/authentication/authenticateAndUpdateProfile'
import {
  CAMPAIGN_METADATA,
  TweetAtPersonSectionNames,
} from '@/components/app/userActionFormTweetAtPerson/constants'
import { OnboardingTweetAtPersonCampaign } from '@/components/app/userActionFormTweetAtPerson/sessions/onboarding'
import { TweetedAtPersonSuccessSection } from '@/components/app/userActionFormTweetAtPerson/sessions/success'
import { TweetAtPersonSection } from '@/components/app/userActionFormTweetAtPerson/sessions/tweet'
import { useSections } from '@/hooks/useSections'
import { UserActionTweetAtPersonCampaignName } from '@/utils/shared/userActionCampaigns'

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
        <AuthenticateWithProfileUpdate>
          <TweetAtPersonSection sectionProps={sectionProps} slug={slug} />
        </AuthenticateWithProfileUpdate>
      )
    case TweetAtPersonSectionNames.SUCCESS:
      return <TweetedAtPersonSuccessSection />
    default:
      onTabNotFound()
      return null
  }
}

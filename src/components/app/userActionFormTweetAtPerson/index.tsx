'use client'

import { AuthenticateWithProfileUpdate } from '@/components/app/authentication/authenticateAndUpdateProfile'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_PIZZA_DAY_TWEETED_AT_PERSON_CAMPAIGN,
  TweetAtPersonSectionNames,
} from '@/components/app/userActionFormTweetAtPerson/constants'
import { OnboardingTweetAtPersonCampaign } from '@/components/app/userActionFormTweetAtPerson/sessions/onboarding'
import { TweetedAtPersonSuccessSection } from '@/components/app/userActionFormTweetAtPerson/sessions/success'
import { TweetAtPersonSection } from '@/components/app/userActionFormTweetAtPerson/sessions/tweet'
import { useSections } from '@/hooks/useSections'
import { UserActionTweetedAtPersonCampaignName } from '@/utils/shared/userActionCampaigns'

interface UserActionFormTweetAtPersonProps {
  slug: UserActionTweetedAtPersonCampaignName
}

export function UserActionFormTweetAtPerson({ slug }: UserActionFormTweetAtPersonProps) {
  const sectionProps = useSections<TweetAtPersonSectionNames>({
    sections: Object.values(TweetAtPersonSectionNames),
    initialSectionId: TweetAtPersonSectionNames.ONBOARDING,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_PIZZA_DAY_TWEETED_AT_PERSON_CAMPAIGN,
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

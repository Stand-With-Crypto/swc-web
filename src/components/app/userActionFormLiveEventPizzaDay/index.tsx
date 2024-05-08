'use client'

import { AuthenticateWithProfileUpdate } from '@/components/app/authentication/authenticateAndUpdateProfile'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_PIZZA_DAY_LIVE_EVENT,
  PizzaDaySectionNames,
} from '@/components/app/userActionFormLiveEventPizzaDay/constants'
import { OnboardingPizzaDayLiveEvent } from '@/components/app/userActionFormLiveEventPizzaDay/sessions/onboarding'
import { PizzaDaySuccessSection } from '@/components/app/userActionFormLiveEventPizzaDay/sessions/success'
import { TweetPizzaDayLiveEvent } from '@/components/app/userActionFormLiveEventPizzaDay/sessions/tweet'
import { useSections } from '@/hooks/useSections'

export function UserActionFormPizzaDayLiveEvent() {
  const sectionProps = useSections<PizzaDaySectionNames>({
    sections: Object.values(PizzaDaySectionNames),
    initialSectionId: PizzaDaySectionNames.ONBOARDING,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_PIZZA_DAY_LIVE_EVENT,
  })
  const { currentSection: currentTab, onSectionNotFound: onTabNotFound } = sectionProps

  switch (currentTab) {
    case PizzaDaySectionNames.ONBOARDING:
      return <OnboardingPizzaDayLiveEvent {...sectionProps} />
    case PizzaDaySectionNames.TWEET:
      return (
        <AuthenticateWithProfileUpdate>
          <TweetPizzaDayLiveEvent {...sectionProps} />
        </AuthenticateWithProfileUpdate>
      )
    case PizzaDaySectionNames.SUCCESS:
      return <PizzaDaySuccessSection />
    default:
      onTabNotFound()
      return null
  }
}

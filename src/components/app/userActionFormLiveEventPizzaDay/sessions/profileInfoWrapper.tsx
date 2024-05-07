'use client'

import { SectionNames } from '@/components/app/userActionFormLiveEventPizzaDay/constants'
import { zodProfileFieldsValidationForLiveEvent } from '@/components/app/userActionFormLiveEventPizzaDay/constants/schemas'
import { ProfileInfoSection } from '@/components/app/userActionFormLiveEventPizzaDay/sessions/profileInfo'
import { ProfileInfoSkeleton } from '@/components/app/userActionFormLiveEventPizzaDay/skeletons/profileInfoSkeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { UseSectionsReturn } from '@/hooks/useSections'

export function ProfileInfoWrapper(sectionProps: UseSectionsReturn<SectionNames>) {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const user = fetchUser.data?.user ?? null

  if (fetchUser.isLoading) return <ProfileInfoSkeleton />

  const userHasMissingRequiredFields =
    zodProfileFieldsValidationForLiveEvent.safeParse(user).success === false

  if (!userHasMissingRequiredFields) sectionProps.goToSection(SectionNames.TWEET)

  return <ProfileInfoSection {...sectionProps} user={user} />
}

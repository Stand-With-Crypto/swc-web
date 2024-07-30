'use client'
import { useEffect } from 'react'

import { ClientAddress } from '@/clientModels/clientAddress'
import { SensitiveDataClientUserWithENSData } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { ANALYTICS_NAME_UPDATE_USER_PROFILE_FORM } from '@/components/app/updateUserProfileForm/constants'
import { UpdateUserProfileFormExperimentTesting } from '@/components/app/updateUserProfileForm/step1'
import { useSections } from '@/hooks/useSections'
import { trackSectionVisible } from '@/utils/web/clientAnalytics'

enum Sections {
  Profile = 'Profile',
  InformationVisibility = 'Information Visibility', // Currently not used
}

export function UpdateUserProfileFormContainer({
  user,
  onSuccess,
}: {
  user: SensitiveDataClientUserWithENSData & { address: ClientAddress | null }
  onSuccess: () => void
}) {
  const sections = useSections({
    sections: [Sections.Profile, Sections.InformationVisibility],
    initialSectionId: Sections.Profile,
    analyticsName: ANALYTICS_NAME_UPDATE_USER_PROFILE_FORM,
  })
  useEffect(() => {
    trackSectionVisible({
      sectionGroup: ANALYTICS_NAME_UPDATE_USER_PROFILE_FORM,
      section: Sections.Profile,
    })
  }, [])

  if (sections.currentSection === Sections.Profile) {
    return <UpdateUserProfileFormExperimentTesting onSuccess={onSuccess} user={user} />
  }

  return null
}

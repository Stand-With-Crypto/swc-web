'use client'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useSWRConfig } from 'swr'

import { ClientAddress } from '@/clientModels/clientAddress'
import { SensitiveDataClientUserWithENSData } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { ANALYTICS_NAME_UPDATE_USER_PROFILE_FORM } from '@/components/app/updateUserProfileForm/constants'
import { UpdateUserProfileForm } from '@/components/app/updateUserProfileForm/step1'
import { UpdateUserInformationVisibilityForm } from '@/components/app/updateUserProfileForm/step2'
import { dialogButtonStyles } from '@/components/ui/dialog/styles'
import { useSections } from '@/hooks/useSections'
import { apiUrls } from '@/utils/shared/urls'
import { trackSectionVisible } from '@/utils/web/clientAnalytics'
import { cn } from '@/utils/web/cn'

export enum UserProfileFormSections {
  Profile = 'Profile',
  InformationVisibility = 'Information Visibility', // Currently not used
}

export function UpdateUserProfileFormContainer({
  user,
  onSuccess,
  skipSections,
}: {
  user: SensitiveDataClientUserWithENSData & { address: ClientAddress | null }
  onSuccess: () => void
  skipSections?: UserProfileFormSections[]
}) {
  const sections = useSections({
    sections: [UserProfileFormSections.Profile, UserProfileFormSections.InformationVisibility],
    initialSectionId: UserProfileFormSections.Profile,
    analyticsName: ANALYTICS_NAME_UPDATE_USER_PROFILE_FORM,
    skipSections,
  })
  useEffect(() => {
    trackSectionVisible({
      sectionGroup: ANALYTICS_NAME_UPDATE_USER_PROFILE_FORM,
      section: UserProfileFormSections.Profile,
    })
  }, [])

  const { mutate } = useSWRConfig()

  // we need to leverage the data submitted in the first step in the second step (whether we show the option to use first/last name)
  const [statefulUser, setStatefulUser] = useState(user)

  if (sections.currentSection === UserProfileFormSections.Profile) {
    return (
      <UpdateUserProfileForm
        onSuccess={newFields => {
          const { address: _, ...updatedFields } = newFields
          setStatefulUser(prev => ({ ...prev, ...updatedFields }))
          void mutate(apiUrls.userFullProfileInfo())
          sections.goToSection(UserProfileFormSections.InformationVisibility)
          if (skipSections?.includes(UserProfileFormSections.InformationVisibility)) {
            onSuccess()
          }
        }}
        user={user}
      />
    )
  }
  if (sections.currentSection === UserProfileFormSections.InformationVisibility) {
    return (
      <div className="px-4 md:px-6">
        <div
          className={cn('left-2', dialogButtonStyles)}
          onClick={() => sections.goToSection(UserProfileFormSections.Profile)}
          role="button"
        >
          <ArrowLeft size={20} />
        </div>
        <UpdateUserInformationVisibilityForm onSuccess={onSuccess} user={statefulUser} />
      </div>
    )
  }

  return null
}

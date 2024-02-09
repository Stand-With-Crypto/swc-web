'use client'
import { ClientAddress } from '@/clientModels/clientAddress'
import { SensitiveDataClientUserWithENSData } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { ANALYTICS_NAME_UPDATE_USER_PROFILE_FORM } from '@/components/app/updateUserProfileForm/constants'
import { UpdateUserProfileForm } from '@/components/app/updateUserProfileForm/step1'
import { UpdateUserInformationVisibilityForm } from '@/components/app/updateUserProfileForm/step2'
import { useSections } from '@/hooks/useSections'
import { useState } from 'react'

enum Sections {
  Profile = 'Profile',
  InformationVisibility = 'Information Visibility',
}

export function UpdateUserProfileFormContainer({
  user,
  onCancel,
  onSuccess,
}: {
  user: SensitiveDataClientUserWithENSData & { address: ClientAddress | null }
  onCancel: () => void
  onSuccess: () => void
}) {
  const sections = useSections({
    sections: [Sections.Profile, Sections.InformationVisibility],
    initialSectionId: Sections.Profile,
    analyticsName: ANALYTICS_NAME_UPDATE_USER_PROFILE_FORM,
  })
  // we need to leverage the data submitted in the first step in the second step (whether we show the option to use first/last name)
  const [statefulUser, setStatefulUser] = useState(user)

  if (sections.currentSection === Sections.Profile) {
    return (
      <UpdateUserProfileForm
        onCancel={() => sections.goToSection(Sections.InformationVisibility)}
        onSuccess={newFields => {
          setStatefulUser({ ...user, ...newFields })
          sections.goToSection(Sections.InformationVisibility)
        }}
        user={user}
      />
    )
  }
  if (sections.currentSection === Sections.InformationVisibility) {
    return (
      <UpdateUserInformationVisibilityForm
        onCancel={onCancel}
        onSuccess={onSuccess}
        user={statefulUser}
      />
    )
  }
}

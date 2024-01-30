'use client'
import { ClientAddress } from '@/clientModels/clientAddress'
import { SensitiveDataClientUserWithENSData } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { UpdateUserProfileForm } from '@/components/app/updateUserProfileForm/step1'
import { UpdateUserInformationVisibilityForm } from '@/components/app/updateUserProfileForm/step2'
import { useTabs } from '@/hooks/useTabs'
import { useState } from 'react'

enum Tabs {
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
  const tabs = useTabs({
    tabs: [Tabs.Profile, Tabs.InformationVisibility],
    initialTabId: Tabs.Profile,
  })
  // we need to leverage the data submitted in the first step in the second step (whether we show the option to use first/last name)
  const [statefulUser, setStatefulUser] = useState(user)

  if (tabs.currentTab === Tabs.Profile) {
    return (
      <UpdateUserProfileForm
        user={user}
        onCancel={() => tabs.gotoTab(Tabs.InformationVisibility)}
        onSuccess={newFields => {
          setStatefulUser({ ...user, ...newFields })
          tabs.gotoTab(Tabs.InformationVisibility)
        }}
      />
    )
  }
  if (tabs.currentTab === Tabs.InformationVisibility) {
    return (
      <UpdateUserInformationVisibilityForm
        user={statefulUser}
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    )
  }
}

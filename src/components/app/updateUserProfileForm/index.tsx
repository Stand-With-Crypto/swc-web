'use client'
import { ClientAddress } from '@/clientModels/clientAddress'
import { SensitiveDataClientUserWithENSData } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { UpdateUserProfileForm } from '@/components/app/updateUserProfileForm/step1'
import { UpdateUserInformationVisibilityForm } from '@/components/app/updateUserProfileForm/step2'
import { useTabs } from '@/hooks/useTabs'

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

  if (tabs.currentTab === Tabs.Profile) {
    return (
      <UpdateUserProfileForm
        user={user}
        onCancel={() => tabs.gotoTab(Tabs.InformationVisibility)}
        onSuccess={() => tabs.gotoTab(Tabs.InformationVisibility)}
      />
    )
  }
  if (tabs.currentTab === Tabs.InformationVisibility) {
    return (
      <UpdateUserInformationVisibilityForm user={user} onCancel={onCancel} onSuccess={onSuccess} />
    )
  }
}

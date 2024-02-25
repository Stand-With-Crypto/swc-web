import { PageTitle } from '@/components/ui/pageTitleText'

import { UserConfig } from './userConfig'

export const dynamic = 'error'

export default function UserSettingsPage() {
  return (
    <div className="container mx-auto max-w-lg space-y-16">
      <PageTitle>User Settings</PageTitle>

      <UserConfig />
    </div>
  )
}

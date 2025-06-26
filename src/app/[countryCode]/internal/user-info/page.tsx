'use client'

import { useCookie } from 'react-use'

import { UserActionsTable } from '@/components/app/userActionsDebugTable'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useApiUserActions } from '@/hooks/useApiUserActions'
import { useSession } from '@/hooks/useSession'
import { USER_ACCESS_LOCATION_COOKIE_NAME } from '@/utils/shared/userAccessLocation'

export default function UserSettingsPage() {
  const [countryCode] = useCookie(USER_ACCESS_LOCATION_COOKIE_NAME)
  const parsedCountryCode = countryCode?.toLowerCase()
  const session = useSession()
  const userActionsQuery = useApiUserActions()

  return (
    <div className="container mx-auto max-w-6xl space-y-8">
      <PageTitle size="lg">User info</PageTitle>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>ID</Label>
          <Input readOnly value={session.user?.id ?? ''} />
        </div>
        <div>
          <Label>Country Code</Label>
          <Input readOnly value={parsedCountryCode ?? ''} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <PageTitle size="md">User Actions</PageTitle>
          <div className="text-sm text-gray-500">
            {userActionsQuery.data
              ? `${userActionsQuery.data.userActions.length} actions found`
              : 'Loading...'}
          </div>
        </div>

        <UserActionsTable
          isLoading={userActionsQuery.isLoading}
          userActions={userActionsQuery.data?.userActions ?? []}
        />
      </div>
    </div>
  )
}

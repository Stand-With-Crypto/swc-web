'use client'

import { useCookie } from 'react-use'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useSession } from '@/hooks/useSession'
import {
  parseUserCountryCodeCookie,
  USER_COUNTRY_CODE_COOKIE_NAME,
} from '@/utils/server/getCountryCode'

export default function UserSettingsPage() {
  const [countryCode] = useCookie(USER_COUNTRY_CODE_COOKIE_NAME)
  const parsedCountryCode = parseUserCountryCodeCookie(countryCode)
  const session = useSession()

  return (
    <div className="container mx-auto max-w-lg space-y-4">
      <PageTitle size="lg">User info</PageTitle>

      <div>
        <Label>ID</Label>
        <Input readOnly value={session.user?.id ?? ''} />
      </div>
      <div>
        <Label>Country Code</Label>
        <Input readOnly value={parsedCountryCode?.countryCode ?? ''} />
      </div>
    </div>
  )
}

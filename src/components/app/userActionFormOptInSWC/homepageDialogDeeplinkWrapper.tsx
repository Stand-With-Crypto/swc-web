'use client'

import { UserActionFormOptInSWC } from '@/components/app/userActionFormOptInSWC'
import { UserActionFormOptInSWCSkeleton } from '@/components/app/userActionFormOptInSWC/skeleton'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreen'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useLocale } from '@/hooks/useLocale'
import { getIntlUrls } from '@/utils/shared/urls'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function UserActionFormOptInSWCDeeplinkWrapper() {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const router = useRouter()
  const locale = useLocale()
  const urls = getIntlUrls(locale)
  const [state, setState] = useState<'form' | 'success'>('form')
  const { user } = fetchUser.data || { user: null }
  return fetchUser.isLoading ? (
    <UserActionFormOptInSWCSkeleton locale={locale} />
  ) : state === 'form' ? (
    <UserActionFormOptInSWC
      onCancel={() => router.replace(urls.home())}
      onSuccess={() => setState('success')}
    />
  ) : (
    <UserActionFormSuccessScreen />
  )
}

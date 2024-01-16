'use client'

import { UserActionFormCallCongressperson } from '@/components/app/userActionFormCallCongressperson'
import { UserActionFormCallCongresspersonSkeleton } from '@/components/app/userActionFormCallCongressperson/skeleton'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreen'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useLocale } from '@/hooks/useLocale'
import { getIntlUrls } from '@/utils/shared/urls'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function UserActionFormCallCongresspersonDeeplinkWrapper() {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const router = useRouter()
  const locale = useLocale()
  const urls = getIntlUrls(locale)
  const [state, setState] = useState<'form' | 'success'>('form')
  const { user } = fetchUser.data || { user: null }
  return fetchUser.isLoading ? (
    <UserActionFormCallCongresspersonSkeleton locale={locale} />
  ) : state === 'form' ? (
    <UserActionFormCallCongressperson
      user={user}
      onCancel={() => router.replace(urls.home())}
      onSuccess={() => setState('success')}
    />
  ) : (
    <UserActionFormSuccessScreen />
  )
}

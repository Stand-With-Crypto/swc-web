'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { UserActionFormEmailCongressperson } from '@/components/app/userActionFormEmailCongressperson'
import { UserActionFormEmailCongresspersonSkeleton } from '@/components/app/userActionFormEmailCongressperson/skeleton'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useLocale } from '@/hooks/useLocale'
import { getIntlUrls } from '@/utils/shared/urls'

export function UserActionFormEmailCongresspersonDeeplinkWrapper() {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const router = useRouter()
  const locale = useLocale()
  const urls = getIntlUrls(locale)
  const [state, setState] = useState<'form' | 'success'>('form')
  const { user } = fetchUser.data || { user: null }
  return fetchUser.isLoading ? (
    <UserActionFormEmailCongresspersonSkeleton locale={locale} />
  ) : state === 'form' ? (
    <UserActionFormEmailCongressperson
      onCancel={() => router.replace(urls.home())}
      onSuccess={() => setState('success')}
      user={user}
    />
  ) : (
    <UserActionFormSuccessScreen onClose={() => router.replace(urls.home())} />
  )
}

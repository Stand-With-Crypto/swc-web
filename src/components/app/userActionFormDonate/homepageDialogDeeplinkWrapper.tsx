'use client'

import { UserActionFormDonate } from '@/components/app/userActionFormDonate'
import { UserActionFormDonateSkeleton } from '@/components/app/userActionFormDonate/skeleton'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useLocale } from '@/hooks/useLocale'
import { getIntlUrls } from '@/utils/shared/urls'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function UserActionFormDonateDeeplinkWrapper() {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const router = useRouter()
  const locale = useLocale()
  const urls = getIntlUrls(locale)
  const [state, setState] = useState<'form' | 'success'>('form')
  return fetchUser.isLoading ? (
    <UserActionFormDonateSkeleton locale={locale} />
  ) : state === 'form' ? (
    <UserActionFormDonate
      onCancel={() => router.replace(urls.home())}
      onSuccess={() => setState('success')}
    />
  ) : (
    <UserActionFormSuccessScreen onClose={() => router.replace(urls.home())} />
  )
}

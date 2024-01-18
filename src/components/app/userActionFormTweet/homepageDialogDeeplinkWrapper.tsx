'use client'

import { UserActionFormTweet } from '@/components/app/userActionFormTweet'
import { UserActionFormTweetSkeleton } from '@/components/app/userActionFormTweet/skeleton'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreen'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useLocale } from '@/hooks/useLocale'
import { getIntlUrls } from '@/utils/shared/urls'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function UserActionFormTweetDeeplinkWrapper() {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const router = useRouter()
  const locale = useLocale()
  const urls = getIntlUrls(locale)
  const [state, setState] = useState<'form' | 'success'>('form')
  return fetchUser.isLoading ? (
    <UserActionFormTweetSkeleton locale={locale} />
  ) : state === 'form' ? (
    <UserActionFormTweet
      onCancel={() => router.replace(urls.home())}
      onSuccess={() => setState('success')}
    />
  ) : (
    <UserActionFormSuccessScreen />
  )
}

'use client'

import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { UserActionFormVoterRegistrationNft } from '@/components/app/userActionFormVoterRegistrationNft'
import { UserActionFormVoterRegistrationNftSkeleton } from '@/components/app/userActionFormVoterRegistrationNft/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useLocale } from '@/hooks/useLocale'
import { getIntlUrls } from '@/utils/shared/urls'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function UserActionFormVoterRegistrationNftDeeplinkWrapper() {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const router = useRouter()
  const locale = useLocale()
  const urls = getIntlUrls(locale)
  const [state, setState] = useState<'form' | 'success'>('form')
  return fetchUser.isLoading ? (
    <UserActionFormVoterRegistrationNftSkeleton locale={locale} />
  ) : state === 'form' ? (
    <UserActionFormVoterRegistrationNft
      onCancel={() => router.replace(urls.home())}
      onSuccess={() => setState('success')}
    />
  ) : (
    <UserActionFormSuccessScreen onClose={() => router.replace(urls.home())} />
  )
}

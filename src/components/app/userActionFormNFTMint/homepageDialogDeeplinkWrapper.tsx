'use client'

import { UserActionFormNFTMint } from '@/components/app/userActionFormNFTMint'
import { UserActionFormNFTMintSkeleton } from '@/components/app/userActionFormNFTMint/skeleton'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreen'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useLocale } from '@/hooks/useLocale'
import { getIntlUrls } from '@/utils/shared/urls'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function UserActionFormNFTMintDeeplinkWrapper() {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const router = useRouter()
  const locale = useLocale()
  const urls = getIntlUrls(locale)
  const [state, setState] = useState<'form' | 'success'>('form')
  const { user } = fetchUser.data || { user: null }
  return fetchUser.isLoading ? (
    <UserActionFormNFTMintSkeleton locale={locale} />
  ) : state === 'form' ? (
    <UserActionFormNFTMint
      onCancel={() => router.replace(urls.home())}
      onSuccess={() => setState('success')}
    />
  ) : (
    <UserActionFormSuccessScreen />
  )
}

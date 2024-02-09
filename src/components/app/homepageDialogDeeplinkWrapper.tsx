'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { UserActionFormNFTMint } from '@/components/app/userActionFormNFTMint'
import { UserActionFormNFTMintSkeleton } from '@/components/app/userActionFormNFTMint/skeleton'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useLocale } from '@/hooks/useLocale'
import { getIntlUrls } from '@/utils/shared/urls'

export function UserActionFormNFTMintDeeplinkWrapper() {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const router = useRouter()
  const locale = useLocale()
  const urls = getIntlUrls(locale)
  const [state, setState] = useState<'form' | 'success'>('form')
  return fetchUser.isLoading ? (
    <UserActionFormNFTMintSkeleton locale={locale} />
  ) : state === 'form' ? (
    <UserActionFormNFTMint
      onCancel={() => router.replace(urls.home())}
      onSuccess={() => setState('success')}
    />
  ) : (
    <UserActionFormSuccessScreen onClose={() => router.replace(urls.home())} />
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { UserActionFormNFTMint } from '@/components/app/userActionFormNFTMint'
import { UserActionFormNFTMintSkeleton } from '@/components/app/userActionFormNFTMint/skeleton'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useIntlUrls } from '@/hooks/useIntlUrls'

export function UserActionFormNFTMintDeeplinkWrapper() {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const router = useRouter()
  const urls = useIntlUrls()
  const [state, setState] = useState<'form' | 'success'>('form')
  return fetchUser.isLoading ? (
    <UserActionFormNFTMintSkeleton />
  ) : state === 'form' ? (
    <UserActionFormNFTMint
      onCancel={() => router.replace(urls.home())}
      onSuccess={() => setState('success')}
    />
  ) : (
    <UserActionFormSuccessScreen onClose={() => router.replace(urls.home())} />
  )
}

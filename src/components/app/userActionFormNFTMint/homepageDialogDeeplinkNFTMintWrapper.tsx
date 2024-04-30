'use client'

import { UserActionFormNFTMint } from '@/components/app/userActionFormNFTMint'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'

export function HomepageDialogDeeplinkNFTMintWrapper() {
  usePreventOverscroll()

  return <UserActionFormNFTMint trackMount />
}

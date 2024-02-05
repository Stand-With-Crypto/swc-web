import { UserActionFormNFTMintDeeplinkWrapper } from '@/components/app/userActionFormNFTMint/homepageDialogDeeplinkWrapper'

export const revalidate = 3600
export const dynamic = 'error'

export default function UserActionNFTMintDeepLink() {
  return <UserActionFormNFTMintDeeplinkWrapper />
}

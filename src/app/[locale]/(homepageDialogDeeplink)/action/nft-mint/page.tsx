import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormNFTMintDeeplinkWrapper } from '@/components/app/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'

export const revalidate = 3600
export const dynamic = 'error'

export default function UserActionNFTMintDeepLink({ params }: PageProps) {
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <UserActionFormNFTMintDeeplinkWrapper />
    </HomepageDialogDeeplinkLayout>
  )
}

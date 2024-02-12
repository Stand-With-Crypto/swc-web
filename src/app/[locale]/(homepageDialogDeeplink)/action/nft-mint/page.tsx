import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormNFTMintDeeplinkWrapper } from '@/components/app/homepageDialogDeeplinkWrapper'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

import { PageProps } from '@/types'

export const revalidate = SECONDS_DURATION.HOUR
export const dynamic = 'error'

export default function UserActionNFTMintDeepLink({ params }: PageProps) {
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <UserActionFormNFTMintDeeplinkWrapper />
    </HomepageDialogDeeplinkLayout>
  )
}

import { UserActionType } from '@prisma/client'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { HomepageDialogDeeplinkNFTMintWrapper } from '@/components/app/userActionFormNFTMint/homepageDialogDeeplinkNFTMintWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { cn } from '@/utils/web/cn'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = SECONDS_DURATION.HOUR
export const dynamic = 'error'

export default function UserActionNFTMintDeepLink({ params }: PageProps) {
  return (
    <ErrorBoundary
      extras={{
        action: {
          isDeeplink: true,
          actionType: UserActionType.NFT_MINT,
        },
      }}
      severityLevel="error"
      tags={{
        domain: 'UserActionNFTMintDeepLink',
      }}
    >
      <HomepageDialogDeeplinkLayout pageParams={params}>
        <div
          className={cn(
            'flex flex-col items-center justify-center max-md:h-full',
            dialogContentPaddingStyles,
          )}
        >
          <HomepageDialogDeeplinkNFTMintWrapper />
        </div>
      </HomepageDialogDeeplinkLayout>
    </ErrorBoundary>
  )
}

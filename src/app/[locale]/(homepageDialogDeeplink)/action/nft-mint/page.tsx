import { UserActionType } from '@prisma/client'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { HomepageDialogDeeplinkNFTMintWrapper } from '@/components/app/userActionFormNFTMint/homepageDialogDeeplinkNFTMintWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { cn } from '@/utils/web/cn'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'

export default async function UserActionNFTMintDeepLink(props: PageProps) {
  const params = await props.params
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <div
        className={cn(
          'flex flex-col items-center justify-center max-md:h-full',
          dialogContentPaddingStyles,
        )}
      >
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
          <HomepageDialogDeeplinkNFTMintWrapper />
        </ErrorBoundary>
      </div>
    </HomepageDialogDeeplinkLayout>
  )
}

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { HomepageDialogDeeplinkNFTMintWrapper } from '@/components/app/userActionFormNFTMint/homepageDialogDeeplinkNFTMintWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { cn } from '@/utils/web/cn'

export const revalidate = SECONDS_DURATION.HOUR
export const dynamic = 'error'

export default function UserActionNFTMintDeepLink({ params }: PageProps) {
  return (
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
  )
}

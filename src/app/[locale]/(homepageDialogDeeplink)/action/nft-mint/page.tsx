import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormNFTMint } from '@/components/app/userActionFormNFTMint'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { usePreventIOSOverscroll } from '@/hooks/usePreventIOSOverscroll'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { cn } from '@/utils/web/cn'

export const revalidate = SECONDS_DURATION.HOUR
export const dynamic = 'error'

export default function UserActionNFTMintDeepLink({ params }: PageProps) {
  usePreventIOSOverscroll()

  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <div
        className={cn(
          'flex flex-col items-center justify-center max-md:h-full',
          dialogContentPaddingStyles,
        )}
      >
        <UserActionFormNFTMint trackMount />
      </div>
    </HomepageDialogDeeplinkLayout>
  )
}

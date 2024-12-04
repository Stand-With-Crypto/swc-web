import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { HomepageDialogDeeplinkNFTMintWrapper } from '@/components/app/userActionFormNFTMint/homepageDialogDeeplinkNFTMintWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { cn } from '@/utils/web/cn'

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
        <HomepageDialogDeeplinkNFTMintWrapper />
      </div>
    </HomepageDialogDeeplinkLayout>
  )
}

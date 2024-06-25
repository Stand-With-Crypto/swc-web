import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormCallCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormCallCongressperson/homepageDialogDeeplinkWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { cn } from '@/utils/web/cn'

export const revalidate = SECONDS_DURATION.HOUR
export const dynamic = 'error'

export default function UserActionCallCongresspersonDeepLink({ params }: PageProps) {
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <div className={cn('max-md:h-full', dialogContentPaddingStyles)}>
        <UserActionFormCallCongresspersonDeeplinkWrapper />
      </div>
    </HomepageDialogDeeplinkLayout>
  )
}

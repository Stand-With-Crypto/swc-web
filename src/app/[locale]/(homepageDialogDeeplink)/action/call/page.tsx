import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormCallCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormCallCongressperson/homepageDialogDeeplinkWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const revalidate = SECONDS_DURATION.HOUR
export const dynamic = 'error'

export default function UserActionCallCongresspersonDeepLink({ params }: PageProps) {
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <div className={dialogContentPaddingStyles}>
        <UserActionFormCallCongresspersonDeeplinkWrapper />
      </div>
    </HomepageDialogDeeplinkLayout>
  )
}

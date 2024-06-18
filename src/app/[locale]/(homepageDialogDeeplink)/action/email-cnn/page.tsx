import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormEmailCNNDeeplinkWrapper } from '@/components/app/userActionFormEmailCNN/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const revalidate = SECONDS_DURATION.HOUR
export const dynamic = 'error'

export default function UserActionEmailCNNDeepLink({ params }: PageProps) {
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <UserActionFormEmailCNNDeeplinkWrapper />
    </HomepageDialogDeeplinkLayout>
  )
}

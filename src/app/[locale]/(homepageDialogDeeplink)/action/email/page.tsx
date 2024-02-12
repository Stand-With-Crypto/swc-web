import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormEmailCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormEmailCongressperson/homepageDialogDeeplinkWrapper'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

import { PageProps } from '@/types'

export const revalidate = SECONDS_DURATION.HOUR
export const dynamic = 'error'

export default function UserActionEmailCongresspersonDeepLink({ params }: PageProps) {
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <UserActionFormEmailCongresspersonDeeplinkWrapper />
    </HomepageDialogDeeplinkLayout>
  )
}

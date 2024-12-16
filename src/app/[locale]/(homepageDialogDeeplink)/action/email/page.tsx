import { UserActionType } from '@prisma/client'

import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormEmailCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormEmailCongressperson/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = SECONDS_DURATION.HOUR
export const dynamic = 'error'

export default function UserActionEmailCongresspersonDeepLink({ params }: PageProps) {
  return (
    <ErrorBoundary
      extras={{
        action: {
          isDeeplink: true,
          actionType: UserActionType.EMAIL,
        },
      }}
      severityLevel="error"
      tags={{
        domain: 'UserActionEmailCongresspersonDeepLink',
      }}
    >
      <HomepageDialogDeeplinkLayout pageParams={params}>
        <UserActionFormEmailCongresspersonDeeplinkWrapper />
      </HomepageDialogDeeplinkLayout>
    </ErrorBoundary>
  )
}

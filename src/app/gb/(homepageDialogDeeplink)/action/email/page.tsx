import { UserActionType } from '@prisma/client'

import { GBHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/gb'
import { UserActionEmailCongresspersonRootPageDeeplinkWrapper } from '@/components/app/userActionFormEmailCongressperson/homepageRootDialogDeeplinkWrapper'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export default async function UserActionEmailDeepLink() {
  return (
    <GBHomepageDialogDeeplinkLayout size="sm">
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
        <UserActionEmailCongresspersonRootPageDeeplinkWrapper />
      </ErrorBoundary>
    </GBHomepageDialogDeeplinkLayout>
  )
}

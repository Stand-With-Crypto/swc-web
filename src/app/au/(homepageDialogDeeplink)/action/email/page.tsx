import { UserActionType } from '@prisma/client'

import { AUHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/au'
import { UserActionEmailCongresspersonRootPageDeeplinkWrapper } from '@/components/app/userActionFormEmailCongressperson/homepageRootDialogDeeplinkWrapper'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export default async function UserActionEmailDeepLink() {
  return (
    <AUHomepageDialogDeeplinkLayout>
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
    </AUHomepageDialogDeeplinkLayout>
  )
}
